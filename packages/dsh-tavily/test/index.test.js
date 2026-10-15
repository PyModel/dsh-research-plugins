import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createLaunchEnvironmentSnapshot } from "@deepseek-ai/dsh-launch-environment";
import { apply, ENABLED_REF } from "../lib/index.js";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

// A host context shaped like DSH's. The launch environment is an explicit empty
// snapshot so real TAVILY_API_KEY / DEEPSEEK_API_KEY in process.env never leak in.
// `services` lists what the profile mounts: ctx.inject(deps, fn) runs fn only
// when every dep is present, as Cordis does for optional children.
function host({ creds = {}, services = ["settings", "connection"], settings = "0.2", deepseek = true } = {}) {
  const seen = { providers: [], routes: [], effects: [], settings: [], disposed: 0, deepseekCalls: 0 };
  const launchEnvironment = createLaunchEnvironmentSnapshot([{ source: "process", values: {} }]);
  const searchProviders = new Map();
  if (deepseek) {
    searchProviders.set("deepseek-official", {
      id: "deepseek-official",
      search: async () => { seen.deepseekCalls++; return { sources: [{ url: "https://deepseek.example" }], truncated: false }; },
    });
  }
  const ctx = {
    fiber: "plugin-fiber",
    get: (name) => {
      if (name === "credentials") return { resolve: async (ref) => ({ value: creds[ref] }) };
      if (name === "launchEnvironment") return launchEnvironment;
      return undefined;
    },
    web: { searchProviders, registerSearchProvider: (provider) => seen.providers.push(provider) },
    effect: (fn, label) => seen.effects.push({ label, result: fn() }),
    inject: (deps, fn) => { if (deps.every((d) => services.includes(d))) fn(ctx); },
  };
  if (services.includes("connection")) {
    ctx.connection = {
      fetch: {
        register: (route) => {
          seen.routes.push(route);
          return () => seen.disposed++;
        },
      },
    };
  }
  if (services.includes("settings")) {
    // 0.1.5 has register(ns, schema); 0.1.7+ has configure(policy, fiber).
    ctx.settings = settings === "0.1.5"
      ? { register: (...args) => seen.settings.push(["register", ...args]) }
      : { configure: (...args) => { seen.settings.push(["configure", ...args]); return () => {}; } };
  }
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
  it("loads in a headless profile with neither connection nor settings", () => {
    const seen = host({ services: [] });
    assert.equal(seen.providers.length, 1);
    assert.equal(seen.providers[0].id, "tavily");
    assert.equal(seen.routes.length, 0);
  });

  it("registers the Config namespace on DSH 0.1.5", () => {
    const seen = host({ settings: "0.1.5" });
    assert.deepEqual(seen.settings[0].slice(0, 2), ["register", "web-search-tavily"]);
  });

  it("tells DSH 0.1.7+ settings that the plugin ships its own page", () => {
    const seen = host();
    assert.deepEqual(seen.settings[0], ["configure", { auto: false }, "plugin-fiber"]);
  });

  it("registers the probe on the authenticated /api channel, released on reload", () => {
    const seen = host();
    assert.deepEqual(
      { path: seen.routes[0].path, methods: seen.routes[0].methods },
      { path: "/api/tavily-probe", methods: ["POST"] },
    );
    const effect = seen.effects.find((e) => e.label === "tavily probe route");
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
    it(`delegates to the registered official DeepSeek provider when the toggle is ${label}`, async () => {
      const seen = host({ creds });
      const { sources } = await seen.providers[0].search({ query: "q" });
      assert.equal(seen.deepseekCalls, 1);
      assert.deepEqual(sources.map((s) => s.url), ["https://deepseek.example"]);
      assert.equal(tavilyCalls().length, 0);
    });
  }

  it("names the missing official provider instead of failing obscurely", async () => {
    const [provider] = host({ deepseek: false }).providers;
    await assert.rejects(provider.search({ query: "q" }), { code: "WEB_PROVIDER_CONFIGURED_MISSING" });
  });

  it("refuses a plain-http baseURL that is not loopback", async () => {
    const seen = { providers: [] };
    const ctx = {
      get: (name) => (name === "credentials" ? { resolve: async (ref) => ({ value: { [ENABLED_REF]: "true" }[ref] }) } : undefined),
      web: { searchProviders: new Map(), registerSearchProvider: (p) => seen.providers.push(p) },
      inject: () => {},
    };
    apply(ctx, { baseURL: "http://evil.example" });
    await assert.rejects(seen.providers[0].search({ query: "q" }), /must use https/);
    apply(ctx, { baseURL: "http://127.0.0.1:8787/tavily" });
    await seen.providers[1].search({ query: "q" });
    assert.equal(fetches[0].url, "http://127.0.0.1:8787/tavily/search");
  });
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
  const response = await route.fetch(new Request("http://127.0.0.1/api/tavily-probe", { method: "POST", body: JSON.stringify(body) }));
  return response.json();
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
    assert.deepEqual(await probe(), { ok: true, mode: "keyless" });
  });

  it("rejects a body that is not JSON", async () => {
    const [route] = host().routes;
    const response = await route.fetch(new Request("http://127.0.0.1/api/tavily-probe", { method: "POST", body: "nope" }));
    assert.equal(response.status, 400);
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
