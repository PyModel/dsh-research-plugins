import z from "@deepseek-ai/schemastery";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { WebError } from "@deepseek-ai/dsh-web";

/** Registry id. Must not collide with deepseek-official / exa. */
export const TAVILY_PROVIDER_ID = "tavily";
/** dsh-base registers the official provider under this id on every supported host. */
const DEEPSEEK_PROVIDER_ID = "deepseek-official";
const TAVILY_HOST = "https://api.tavily.com";
const DEFAULT_TIMEOUT_MS = 30_000;
/** Used only when the caller sends no bound; dsh-tool-web always sends one. */
const DEFAULT_MAX_RESULTS = 5;
/** The one credential the server, the settings card and the MCP row all read. */
export const KEY_REF = "TAVILY_API_KEY";
/** Non-secret switch stored via the credentials plane so the settings card can write it on 0.1.5. */
export const ENABLED_REF = "TAVILY_SEARCH_ENABLED";
/** Under the authenticated shared `/api` channel; the card calls it relative to the page. */
export const PROBE_PATH = "/api/tavily-probe";

export const name = "web-search-tavily";
// Only `web` is required: headless / acp / sdk profiles mount neither
// `connection` nor (without a profile) `settings`.
export const inject = ["web"];

export const Config = z.object({
  baseURL: z.string().default(TAVILY_HOST),
  searchTimeoutMs: z.number().step(1).min(1).default(DEFAULT_TIMEOUT_MS),
  searchDepth: z.string().default("basic"),
  autoParameters: z.boolean().default(false),
});

function throwIfAborted(signal) {
  if (signal?.aborted) throw new WebError("Tavily search aborted", "WEB_ABORTED", { cause: signal.reason });
}

function isAbortError(error) {
  return error instanceof DOMException && (error.name === "AbortError" || error.name === "TimeoutError");
}

function truthy(value) {
  if (value == null) return false;
  const v = String(value).trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

/** The key travels in the Authorization header: https, or plain http only to a loopback gateway. */
function searchHost(baseURL) {
  const host = (baseURL || TAVILY_HOST).replace(/\/+$/, "");
  let url;
  try {
    url = new URL(host);
  } catch {
    throw new WebError(`Tavily baseURL is not a URL: ${host}`, "WEB_PROVIDER_ERROR");
  }
  if (url.protocol === "https:" || (url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname))) return host;
  throw new WebError("Tavily baseURL must use https (plain http only to localhost)", "WEB_PROVIDER_ERROR");
}

function deadlineSignal(signal, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) return signal;
  const timer = AbortSignal.timeout(timeoutMs);
  if (!signal) return timer;
  if (typeof AbortSignal.any === "function") return AbortSignal.any([signal, timer]);
  // Fallback for runtimes without AbortSignal.any: forward BOTH sources onto a
  // controller so caller cancellation is not silently dropped.
  const controller = new AbortController();
  signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  timer.addEventListener("abort", () => controller.abort(timer.reason), { once: true });
  return controller.signal;
}

async function resolveRef(ctx, envName) {
  const ref = credentialRef(envName);
  const creds = ctx.get("credentials");
  if (creds) {
    const resolved = await creds.resolve(ref);
    if (resolved?.value && resolved.value.length > 0) return resolved.value;
  }
  const env = launchEnvironmentOf(ctx).get(ref);
  if (env?.value && env.value.length > 0) return env.value;
  return undefined;
}

/** Tavily search_depth tiers: advanced costs 2 credits, the rest 1. */
const SEARCH_DEPTHS = ["basic", "advanced", "fast", "ultra-fast"];

function normalizedSearchDepth(depth) {
  return SEARCH_DEPTHS.includes(depth) ? depth : "basic";
}

function tavilyHeaders(apiKey) {
  const headers = {
    "content-type": "application/json",
    accept: "application/json",
  };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  else headers["x-tavily-access-mode"] = "keyless";
  return headers;
}

/** A non-2xx Tavily response; `status` drives probe classification. */
class TavilyHttpError extends WebError {
  constructor(message, status) {
    super(message, "WEB_PROVIDER_ERROR");
    this.status = status;
  }
}

/**
 * Tavily errors are `{ detail: { error } }`; 422 validation errors are
 * `{ detail: [{ msg }] }`. Anything else keeps the status-line fallback.
 */
function tavilyErrorDetail(json) {
  const detail = json?.detail;
  if (typeof detail === "string") return detail;
  if (typeof detail?.error === "string") return detail.error;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg).filter((m) => typeof m === "string").join("; ");
  return "";
}

async function tavilyHttpError(res) {
  let detail = "";
  try {
    detail = tavilyErrorDetail(await res.json());
  } catch {
    // non-JSON body: status line only
  }
  const message = `Tavily API error (HTTP ${res.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`;
  return new TavilyHttpError(message, res.status);
}

/** Tavily dates are RFC 822 ("Tue, 11 Mar 2025 17:00:00 GMT"); the web seam wants ISO 8601. */
function isoDate(value) {
  if (typeof value !== "string" || !value) return undefined;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? undefined : new Date(ms).toISOString();
}

function toSources(body) {
  const rows = Array.isArray(body?.results) ? body.results : [];
  const sources = [];
  for (const row of rows) {
    if (typeof row?.url !== "string" || row.url.length === 0) continue;
    const item = { url: row.url };
    if (typeof row.title === "string" && row.title) item.title = row.title;
    if (typeof row.content === "string" && row.content) item.snippet = row.content.slice(0, 800);
    const publishedAt = isoDate(row.published_date);
    if (publishedAt) item.publishedAt = publishedAt;
    sources.push(item);
  }
  return { sources, truncated: false };
}

/** HTTP statuses Tavily uses for rate limits (429) and plan / pay-as-you-go caps (432 / 433). */
const LIMIT_STATUSES = new Set([429, 432, 433]);

/** Maps a searchTavily failure onto the settings card's probe codes from its structure, not its wording. */
function classifyProbeError(error) {
  if (error instanceof TavilyHttpError) {
    if (error.status === 401 || error.status === 403) return { code: "invalid_key" };
    if (LIMIT_STATUSES.has(error.status)) return { code: "limit", status: error.status };
    return { code: "http", status: error.status };
  }
  const cause = error?.cause;
  if (error?.code === "WEB_ABORTED" || cause?.name === "TimeoutError" || cause?.name === "AbortError") return { code: "timeout" };
  if (cause instanceof TypeError) return { code: "network" };
  const msg = error instanceof Error ? error.message : String(error);
  return { code: "other", error: msg.slice(0, 80) || "unknown" };
}

/** Tavily accepts max_results 0..20; the seam truncates to the caller's bound regardless. */
const MAX_RESULTS_CAP = 20;

function searchBody(query, opts) {
  const depth = normalizedSearchDepth(opts.searchDepth);
  return {
    query,
    max_results: Math.min(Math.max(1, Math.floor(opts.maxResults ?? DEFAULT_MAX_RESULTS) || 1), MAX_RESULTS_CAP),
    search_depth: depth,
    // ultra-fast returns one summary per URL and rejects chunks_per_source.
    ...(depth === "ultra-fast" ? {} : { chunks_per_source: 3 }),
    auto_parameters: opts.autoParameters === true,
    include_answer: false,
    include_raw_content: false,
    include_images: false,
    // Without it `published_date` is null outside topic=news.
    include_published_date: true,
  };
}

async function searchTavily(query, opts, signal) {
  throwIfAborted(signal);
  const host = searchHost(opts.baseURL);
  const requestSignal = deadlineSignal(signal, opts.searchTimeoutMs);
  let res;
  try {
    res = await fetch(`${host}/search`, {
      method: "POST",
      redirect: "error",
      headers: tavilyHeaders(opts.apiKey),
      body: JSON.stringify(searchBody(query, opts)),
      ...(requestSignal ? { signal: requestSignal } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new WebError(`Tavily search timed out after ${opts.searchTimeoutMs}ms`, "WEB_PROVIDER_ERROR", { cause: error });
    }
    if (signal?.aborted || isAbortError(error)) throw new WebError("Tavily search aborted", "WEB_ABORTED", { cause: error });
    throw new WebError(`Tavily request failed: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
  }
  if (!res.ok) {
    if (signal?.aborted) throwIfAborted(signal);
    throw await tavilyHttpError(res);
  }
  try {
    return toSources(await res.json());
  } catch (error) {
    if (signal?.aborted || isAbortError(error)) throw new WebError("Tavily search aborted", "WEB_ABORTED", { cause: error });
    throw new WebError(`Tavily returned an unprocessable response: ${String(error)}`, "WEB_PROVIDER_ERROR", { cause: error });
  }
}

/**
 * The provider dsh-web-search-deepseek registered. Delegating to it keeps the
 * user's DeepSeek settings, account sign-in and session logging intact.
 * ponytail: dsh-web has no public lookup, so this reads its private
 * `searchProviders` Map (same shape 0.1.5-rc.2 … 0.2.1-alpha.4); switch to an
 * accessor if dsh-web ever exports one.
 */
function officialDeepSeek(web) {
  const provider = web.searchProviders?.get(DEEPSEEK_PROVIDER_ID);
  if (!provider) {
    throw new WebError("Tavily is off and the official DeepSeek search provider is not loaded", "WEB_PROVIDER_CONFIGURED_MISSING");
  }
  return provider;
}

function tavilyOptions(config, overrides) {
  return {
    baseURL: config.baseURL || TAVILY_HOST,
    searchDepth: config.searchDepth || "basic",
    autoParameters: config.autoParameters === true,
    searchTimeoutMs: config.searchTimeoutMs || DEFAULT_TIMEOUT_MS,
    ...overrides,
  };
}

class TavilySearchProvider {
  id = TAVILY_PROVIDER_ID;

  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
  }

  available() {
    return true;
  }

  async search(request, signal) {
    throwIfAborted(signal);
    if (!truthy(await resolveRef(this.ctx, ENABLED_REF))) {
      return officialDeepSeek(this.ctx.web).search(request, signal);
    }
    const apiKey = await resolveRef(this.ctx, KEY_REF);
    return searchTavily(request.query, tavilyOptions(this.config, { apiKey, maxResults: request.maxResults }), signal);
  }
}

/** One real search with the draft key, the saved key, or none (keyless). Never throws. */
async function probe(ctx, config, request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, code: "other", error: "invalid JSON body" }, { status: 400 });
  }
  try {
    const draft = typeof body?.apiKey === "string" ? body.apiKey.trim().slice(0, 512) : "";
    const apiKey = draft || (body?.clearKey === true ? undefined : await resolveRef(ctx, KEY_REF));
    await searchTavily("tavily", tavilyOptions(config, { apiKey, maxResults: 1 }), request.signal);
    return Response.json({ ok: true, mode: apiKey ? "key" : "keyless" }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ ok: false, ...classifyProbeError(error) }, { headers: { "cache-control": "no-store" } });
  }
}

export function apply(ctx, config) {
  ctx.web.registerSearchProvider(new TavilySearchProvider(ctx, config));

  // The card is this plugin's settings page. 0.1.5 needs the namespace
  // registered for its Settings list; 0.1.7+ instead takes a presentation
  // policy saying the plugin ships its own page.
  ctx.inject(["settings"], (child) => {
    if (typeof child.settings.configure === "function") {
      child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
    } else {
      child.settings.register?.("web-search-tavily", Config);
    }
  });

  // Registered on the Connection's shared /api channel, so the host's Host /
  // Origin / sec-fetch-site checks and browser-session cookie run first: a
  // cross-site page cannot spend the saved key's credits.
  ctx.inject(["connection"], (child) => {
    child.effect(() => child.connection.fetch.register({
      path: PROBE_PATH,
      methods: ["POST"],
      requestBody: "buffered",
      fetch: (request) => probe(ctx, config, request),
    }), "tavily probe route");
  });
}
