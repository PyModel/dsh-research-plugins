import z from "@deepseek-ai/schemastery";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { WebError } from "@deepseek-ai/dsh-web";
import {
  DeepSeekSearchProvider,
  DEEPSEEK_DEFAULT_API_VERSION,
  DEEPSEEK_DEFAULT_BASE_URL,
  DEEPSEEK_DEFAULT_MAX_TOKENS,
  DEEPSEEK_DEFAULT_MAX_USES,
  DEEPSEEK_DEFAULT_MODEL,
} from "@deepseek-ai/dsh-web-search-deepseek";

/** Registry id. Must not collide with deepseek-official / exa. */
export const TAVILY_PROVIDER_ID = "tavily";
const TAVILY_HOST = "https://api.tavily.com";
const DEFAULT_KEY_ENV = "TAVILY_API_KEY";
const DEFAULT_TIMEOUT_MS = 30_000;
/** Non-secret switch stored via the credentials plane so the settings card can write it on rc.6. */
export const ENABLED_REF = "TAVILY_SEARCH_ENABLED";

export const name = "web-search-tavily";
export const inject = ["web", "webServer", "settings"];

export const Config = z.object({
  apiKey: z.string().role("secret"),
  apiKeyEnv: z.string().role("credential-ref").default(DEFAULT_KEY_ENV),
  baseURL: z.string().default(TAVILY_HOST),
  allowCustomBaseURL: z.boolean().default(false),
  maxResults: z.number().step(1).min(1).max(20).default(5),
  searchTimeoutMs: z.number().step(1).min(1).default(DEFAULT_TIMEOUT_MS),
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

function searchHost(baseURL, allowCustom) {
  const host = (baseURL || TAVILY_HOST).replace(/\/+$/, "");
  if (host === TAVILY_HOST) return host;
  if (!allowCustom) {
    throw new WebError(`Tavily baseURL must be ${TAVILY_HOST} unless allowCustomBaseURL is true`, "WEB_PROVIDER_ERROR");
  }
  if (!host.startsWith("https://")) {
    throw new WebError("Tavily custom baseURL must use https", "WEB_PROVIDER_ERROR");
  }
  return host;
}

function deadlineSignal(signal, timeoutMs) {
  if (!timeoutMs || timeoutMs <= 0) return signal;
  const timer = AbortSignal.timeout(timeoutMs);
  if (!signal) return timer;
  if (typeof AbortSignal.any === "function") return AbortSignal.any([signal, timer]);
  return timer;
}

async function resolveRef(ctx, envName, literal) {
  if (literal && literal.length > 0) return literal;
  const ref = credentialRef(envName);
  const creds = ctx.get("credentials");
  if (creds) {
    const resolved = await creds.resolve(ref);
    if (resolved?.value && resolved.value.length > 0) return resolved.value;
  }
  const env = launchEnvironmentOf(ctx).get(ref);
