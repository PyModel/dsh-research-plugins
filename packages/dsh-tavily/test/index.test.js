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
const realFetch = globalThis.fetch;
beforeEach(() => {
  fetches = [];
  globalThis.fetch = async (url, init) => {
    fetches.push({ url: String(url), headers: init?.headers ?? {} });
    const body = { results: [{ url: "https://example.com", title: "Example", content: "text" }, { title: "no url" }] };
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
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
