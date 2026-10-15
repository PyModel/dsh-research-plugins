import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { createLaunchEnvironmentSnapshot } from "@deepseek-ai/dsh-launch-environment";
import { apply, ENABLED_REF } from "../lib/index.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

// A host context shaped like DSH's. The launch environment is an explicit empty
// snapshot so real TAVILY_API_KEY / DEEPSEEK_API_KEY in process.env never leak in.
function host({ creds = {}, withRegister = false } = {}) {
  const seen = { providers: [], routes: [], effects: [], settings: [], disposed: 0 };
  const launchEnvironment = createLaunchEnvironmentSnapshot([{ source: "process", values: {} }]);
  const ctx = {
    get: (name) => {
      if (name === "credentials") return { resolve: async (ref) => ({ value: creds[ref] }) };
      if (name === "launchEnvironment") return launchEnvironment;
      return undefined;
    },
    web: { registerSearchProvider: (provider) => seen.providers.push(provider) },
    webServer: {
      register: (route) => {
        seen.routes.push(route);
        return () => seen.disposed++;
      },
    },
    effect: (fn, label) => seen.effects.push({ label, result: fn() }),
    // DSH <= 0.1.5 has settings.register; 0.1.7+ does not.
    settings: withRegister ? { register: (...args) => seen.settings.push(args) } : {},
  };
  apply(ctx, {});
  return seen;
}

let fetches;
let reply;
const realFetch = globalThis.fetch;
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
beforeEach(() => {
  fetches = [];
  reply = () => json(200, { results: [{ url: "https://example.com", title: "Example", content: "text" }, { title: "no url" }] });
  globalThis.fetch = async (url, init) => {
    fetches.push({ url: String(url), headers: init?.headers ?? {}, body: init?.body ? JSON.parse(init.body) : undefined });
    return reply();
  };
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

const tavilyCalls = () => fetches.filter((f) => f.url.startsWith("https://api.tavily.com/"));

describe("apply()", () => {
  it("boots on DSH 0.1.7+, where settings.register does not exist", () => {
    const seen = host();
    assert.equal(seen.providers.length, 1);
    assert.equal(seen.providers[0].id, "tavily");
  });

  it("registers the Config namespace on DSH 0.1.5", () => {
    const seen = host({ withRegister: true });
    assert.equal(seen.settings[0][0], "web-search-tavily");
  });

  it("registers the probe route inside ctx.effect so a reload releases it", () => {
    const seen = host();
    assert.equal(seen.routes[0].path, "/api/tavily-probe");
    const effect = seen.effects.find((e) => e.label === "tavily probe route");
    assert.equal(typeof effect.result, "function");
    effect.result();
    assert.equal(seen.disposed, 1);
  });
});

describe("search provider", () => {
  it("searches Tavily keyless when enabled without a key", async () => {
    const [provider] = host({ creds: { [ENABLED_REF]: "true" } }).providers;
    const { sources } = await provider.search({ query: "q" });
    const [call] = tavilyCalls();
    assert.equal(call.url, "https://api.tavily.com/search");
    assert.equal(call.headers["x-tavily-access-mode"], "keyless");
    assert.equal(call.headers.authorization, undefined);
    assert.deepEqual(sources.map((s) => s.url), ["https://example.com"]);
  });

  it("sends the saved key as a Bearer token", async () => {
    const [provider] = host({ creds: { [ENABLED_REF]: "true", TAVILY_API_KEY: "tvly-test" } }).providers;
    await provider.search({ query: "q" });
    const [call] = tavilyCalls();
    assert.equal(call.headers.authorization, "Bearer tvly-test");
    assert.equal(call.headers["x-tavily-access-mode"], undefined);
  });

  for (const [label, creds] of [["unset", {}], ['"false"', { [ENABLED_REF]: "false" }]]) {
    it(`falls back to official DeepSeek when the toggle is ${label}`, async () => {
      const [provider] = host({ creds }).providers;
      // No DeepSeek key here, so reaching the fallback shows up as its own
      // missing-credential rejection.
      await assert.rejects(provider.search({ query: "q" }), { code: "WEB_PROVIDER_CREDENTIAL_MISSING" });
      assert.equal(tavilyCalls().length, 0);
    });
  }
});

describe("Tavily request and response mapping", () => {
  const enabled = () => host({ creds: { [ENABLED_REF]: "true" } }).providers[0];

  it("converts RFC 822 published dates to the ISO 8601 the web seam expects", async () => {
    reply = () => json(200, { results: [{ url: "https://a.example", published_date: "Tue, 11 Mar 2025 17:00:00 GMT" }, { url: "https://b.example", published_date: "not a date" }] });
    const { sources } = await enabled().search({ query: "q" });
    assert.equal(sources[0].publishedAt, "2025-03-11T17:00:00.000Z");
    assert.equal(sources[1].publishedAt, undefined);
    assert.equal(tavilyCalls()[0].body.include_published_date, true);
  });

  it("clamps the caller's maxResults to Tavily's 1..20", async () => {
    await enabled().search({ query: "q", maxResults: 50 });
    assert.equal(tavilyCalls()[0].body.max_results, 20);
  });

  it("surfaces Tavily's { detail: { error } } message with the status", async () => {
    reply = () => json(432, { detail: { error: "This request exceeds your plan's set usage limit." } });
    await assert.rejects(enabled().search({ query: "q" }), (error) => {
      assert.equal(error.code, "WEB_PROVIDER_ERROR");
      assert.equal(error.status, 432);
      assert.match(error.message, /HTTP 432.*usage limit/);
      return true;
    });
  });
});

async function probe(body = {}) {
  const [route] = host().routes;
  const req = Object.assign(Readable.from([Buffer.from(JSON.stringify(body))]), { method: "POST" });
  const res = {
    writeHead(status) { this.status = status; },
    end(text) { this.body = JSON.parse(text); },
  };
  await route.handler(req, res);
  return res.body;
}

describe("probe classification", () => {
  it("maps 401 to invalid_key", async () => {
    reply = () => json(401, { detail: { error: "Unauthorized: missing or invalid API key." } });
    assert.deepEqual(await probe({ apiKey: "tvly-bad" }), { ok: false, code: "invalid_key" });
  });

  for (const status of [429, 432, 433]) {
    it(`maps ${status} to limit`, async () => {
      reply = () => json(status, { detail: { error: "limit" } });
      assert.deepEqual(await probe(), { ok: false, code: "limit", status });
    });
  }

  it("maps a fetch failure to network", async () => {
    reply = () => { throw new TypeError("fetch failed"); };
    assert.deepEqual(await probe(), { ok: false, code: "network" });
  });
});

describe("probe route", () => {
  it("reports keyless mode when no key is saved", async () => {
    const [route] = host().routes;
    const req = Object.assign(Readable.from([Buffer.from("{}")]), { method: "POST" });
    const res = {
      writeHead(status) { this.status = status; },
      end(body) { this.body = JSON.parse(body); },
    };
    await route.handler(req, res);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true, mode: "keyless" });
  });
});

describe("host compatibility", () => {
  it("never loads the removed @deepseek-ai/dsh-client-runtime", async () => {
    // Its presence blanked the settings card and tripped DSH Desktop's Safe Mode scan.
    assert.doesNotMatch(await read("../lib/client.js"), /dsh-client-runtime/);
    assert.doesNotMatch(await read("../package.json"), /dsh-client-runtime/);
  });

  it("renders the settings card in both the 0.1.5 and 0.1.7+ slots", async () => {
    const client = await read("../lib/client.js");
    assert.match(client, /"settings\.plugin\.item"/);
    assert.match(client, /"plugins\.bundle\.config"/);
  });

  it("keeps dsh-base's fetchProvider in the web override", async () => {
    // An id override replaces `config` wholesale; dropping fetchProvider breaks web fetch.
    assert.match(await read("../cordis.patch.yml"), /- id: web\n\s+config:\n(?:\s+.*\n)*?\s+fetchProvider: http/);
  });
});
