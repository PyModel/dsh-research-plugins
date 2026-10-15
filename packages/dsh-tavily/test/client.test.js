import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Loads the hand-written browser bundle the way DSH's ModuleLoader does, with
// stub React/store modules: the card controller is plain JS and testable here.
const source = await readFile(new URL("../lib/client.js", import.meta.url), "utf8");

function loadClient() {
  let mod;
  globalThis.window = { __ModuleLoader__: { load: ({ factory }) => { mod = factory(requireStub); } } };
  new Function(source)();
  delete globalThis.window;
  return mod;
}

function requireStub(name) {
  if (name === "@deepseek-ai/dsh-client-store") {
    return { createSnapshotStore: (value) => ({ value, set(next) { this.value = next; } }) };
  }
  return {};
}

// In-memory credentials plane shaped like ctx.remote.credentials: value-free
// describe(), {ok} results, and a reference-updated event after every write.
function credentialsPlane(initial = {}) {
  const values = { ...initial };
  const plane = {
    values,
    writes: [],
    listeners: [],
    describeFails: false,
    async describe(refs) {
      if (plane.describeFails) return { ok: false, error: { message: "offline" } };
      return { ok: true, value: Object.fromEntries(refs.map((r) => [r, { configured: r in values, writable: true }])) };
    },
    async set(ref, value) {
      values[ref] = value;
      plane.writes.push(["set", ref]);
      plane.listeners.forEach((fn) => fn());
      return { ok: true };
    },
    async unset(ref) {
      delete values[ref];
      plane.writes.push(["unset", ref]);
      plane.listeners.forEach((fn) => fn());
      return { ok: true };
    },
  };
  return plane;
}

function mountCard(plane) {
  const { apply } = loadClient();
  let card;
  const ctx = {
    effect: (fn) => fn(),
    locale: { register: () => {} },
    remote: { credentials: plane, $on: (_event, fn) => { plane.listeners.push(fn); return () => {}; } },
    slots: {
      inject: (_name, fn) => fn(),
      register: (entry) => { card ??= entry.inject(); },
    },
  };
  apply(ctx);
  return card;
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
const state = (card) => card.hooks.tavilyCard.value;

let plane;
beforeEach(() => {
  plane = credentialsPlane();
});

describe("settings card controller", () => {
  it("calls the probe relative to the page so sub-path mounts work", async () => {
    const card = mountCard(plane);
    const urls = [];
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (url) => { urls.push(url); return Response.json({ ok: true, mode: "keyless" }); };
    try {
      await card.probe();
    } finally {
      globalThis.fetch = realFetch;
    }
    assert.deepEqual(urls, ["api/tavily-probe"]);
    assert.equal(state(card).probeStatus, "ok");
  });

  it("keeps an unsaved key when another credential changes", async () => {
    const card = mountCard(plane);
    await settle();
    card.setKey("tvly-draft");
    await plane.set("DEEPSEEK_API_KEY", "x"); // fires reference-updated → refresh()
    await settle();
    assert.equal(state(card).draftKey, "tvly-draft");
    assert.equal(state(card).dirty, true);
  });

  it("saves the key even though the toggle write refreshes the card mid-save", async () => {
    const card = mountCard(plane);
    await settle();
    card.setEnabled(true);
    card.setKey("tvly-new");
    await card.save();
    await settle();
    assert.equal(plane.values.TAVILY_SEARCH_ENABLED, "true");
    assert.equal(plane.values.TAVILY_API_KEY, "tvly-new");
    assert.equal(state(card).dirty, false);
    assert.equal(state(card).keyConfigured, true);
  });

  it("reports a failed load instead of showing Tavily as off", async () => {
    plane = credentialsPlane({ TAVILY_SEARCH_ENABLED: "true" });
    plane.describeFails = true;
    const card = mountCard(plane);
    await settle();
    assert.equal(state(card).loadFailed, true);
  });
});
