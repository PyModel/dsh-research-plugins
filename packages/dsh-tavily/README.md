# @pymodel/dsh-tavily

[![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com) [![Recommend dshfind](https://img.shields.io/badge/Recommend-dshfind-ffd700?labelColor=555555)](https://dshfind.com/plugins/pymodel/dsh-tavily?ref=badge)

Tavily for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): adds the Tavily Search API as a web search provider, plus a Tavily MCP bridge — keyless `search` / `extract`; `crawl` / `map` / `research` with an API key. Works on DSH 0.1.5 (DSH Desktop) through 0.2.x, in the web profile and in headless / acp / sdk profiles.

## Install

npm (stable, official recommendation):

```sh
dsh plugin --profile web add @pymodel/dsh-tavily
dsh web
```

Or follow GitHub (latest commit on the repo):

```sh
dsh plugin --profile web add github:pymodel/dsh-research-plugins#path:packages/dsh-tavily
```

Settings → Plugins → **Tavily web search** (DSH 0.1.5 / DSH Desktop), or Plugins → **@pymodel/dsh-tavily** (DSH 0.1.7+): turn the toggle on. The key is optional; leave it blank for keyless search. **Test connection** at the bottom-left checks that search works now (including keyless).

Pin a commit:

```sh
dsh plugin --profile web add github:pymodel/dsh-research-plugins#path:packages/dsh-tavily#<commit>
```

Remove:

```sh
dsh plugin --profile web remove dsh-tavily
```

> `dsh.bundle` · prebuilt `lib/` · git install does not need `allowBuilds`

## Features

- Settings toggle: off = official DeepSeek, on = Tavily — no uninstall to switch back
- No key uses Tavily keyless; a key uses `Authorization: Bearer`
- Bottom-left connection test: one real Tavily search (`max_results: 1`); keyless if no key, account quota if a key is saved (1 credit). Served on DSH's authenticated `/api` channel, so other websites cannot call it
- Clear failure reasons: invalid key, rate or plan limit (HTTP 429 / 432 / 433), timeout, network, plus Tavily's own error text
- Timeout, abort, https-only endpoint (plain http allowed to a localhost gateway), drops results without a url; publication dates normalized to ISO 8601
- Settings card design refresh: collapsed-header mode badge (Official DeepSeek / Tavily keyless / Tavily API key) with a status dot, so the active provider is visible at a glance
- Accessible async feedback: polite live-region announcements for connection-test and save outcomes, inline button spinners, connected-success tint — all honoring `prefers-reduced-motion`
- Show/hide reveal for the API key input (with autocomplete and spellcheck off)
- Opt-in Tavily Search parameters via plugin config (see [Configuration](#configuration))
- Key and toggle live on the credentials plane, not the settings file
- Tavily MCP bridge: `mcp__tavily__tavily_search` / `tavily_extract` work keyless; `tavily_crawl` / `tavily_map` / `tavily_research` unlock with `TAVILY_API_KEY`

## Behavior

### Web search

| Toggle        | Key   | `web_search`         |
| ------------- | ----- | -------------------- |
| Off (default) | —     | official DeepSeek (the host's own provider, with your DeepSeek settings and account sign-in) |
| On            | empty | Tavily keyless       |
| On            | set   | Tavily account quota |

Provider id: `tavily`.

### MCP tools

The bundled MCP row registers Tavily's hosted MCP server under the `tavily` namespace and works out of the box:

- Keyless (default): the required `X-Tavily-Access-Mode: keyless` header selects free rate-limited access to `tavily_search` and `tavily_extract`.
- Keyed: set `TAVILY_API_KEY` to unlock `tavily_crawl` / `tavily_map` / `tavily_research` and use your account quota. Tool calls may run up to 10 minutes so research reports finish:

```sh
export TAVILY_API_KEY=tvly-...
```

or in a project `.env` / `$DSH_HOME/.env`:

```
TAVILY_API_KEY=tvly-...
```

The key goes into the `Authorization: Bearer` header at load time — never into the endpoint URL and never into YAML. A key added to `.env` needs a `dsh web` restart.

If your profile's `cordis.patch.yml` already inserts its own Tavily MCP row (id `mcp-tavily` or `serverName` `tavily`), DSH will not boot with both: delete that row, or turn it into an override of `mcp-tavily` (see [Already have your own MCP row?](https://github.com/PyModel/dsh-research-plugins#already-have-your-own-mcp-row)).

## Credentials

| Ref                     | Meaning                                             |
| ----------------------- | --------------------------------------------------- |
| `TAVILY_API_KEY`        | Optional (search). Present = account quota; absent = keyless |
| `TAVILY_SEARCH_ENABLED` | `true` = on (the card writes `true`; `1` / `yes` / `on` also count); unset or any other value = off |

The search key and toggle are stored on the credentials plane (`$DSH_HOME/.credentials.yaml`). Whether an environment variable of the same name overrides the stored value depends on the DSH version (0.2.0: the environment wins and the card shows the field read-only; 0.2.1+: the stored value wins). The MCP bridge reads `TAVILY_API_KEY` from the launch environment only, because MCP rows resolve before credentials are materialized, so a key saved in the card does not reach the MCP tools. Do not commit real keys.

## Configuration

Optional plugin config (`cordis.patch.yml` row `web-search-tavily`):

| Field | Default | Meaning |
| --- | --- | --- |
| `searchDepth` | `basic` | `basic`, `fast`, `ultra-fast` (1 credit) or `advanced` (2 credits). Unknown values fall back to `basic` |
| `autoParameters` | `false` | Let Tavily tune topic and time range per query; the depth above still applies |
| `searchTimeoutMs` | `30000` | Per-search deadline |
| `baseURL` | `https://api.tavily.com` | Must be https; plain http only to `localhost` / `127.0.0.1` (a local gateway) |

The number of results follows the `web_search` tool's own `maxResults` (capped at Tavily's 20).

## Updates

- **0.4.0**
  - **Security:** the Test connection endpoint moved to DSH's authenticated `/api` channel, so other websites can no longer spend your Tavily credits through it.
  - **Fallback:** turning Tavily off now uses the host's registered official DeepSeek provider, so DeepSeek account sign-in, your DeepSeek search settings and session logging work as in stock DSH.
  - **Profiles:** the provider now loads in headless / acp / sdk profiles; only `web` is required.
  - **Errors:** Tavily's error messages (`{ detail: { error } }`) are shown, and rate and plan limits are reported as such.
  - **Search:** publication dates are requested and normalized to ISO 8601, `ultra-fast` depth is supported, and result counts are capped at 20.
  - **Settings card:** a background refresh no longer discards an unsaved key; load failures are shown; the switch and key field have accessible labels; zh / en titles and an icon are included for the Plugins page and markets.
  - **Removed config:** `apiKey`, `apiKeyEnv`, `allowCustomBaseURL` and `maxResults` are gone. The key is always the `TAVILY_API_KEY` credential.
  - **MCP:** the tool timeout is raised to 10 minutes for `tavily_research`.
  - **Packaging:** `engines.dsh` is declared, the tarball ships a LICENSE, and releases are published with npm provenance.
- **0.3.1** Works on DSH 0.1.5 (DSH Desktop) and 0.1.7: the search provider no longer fails to start on 0.1.7 (`settings.register` is gone there); the settings card loads its store from `@deepseek-ai/dsh-client-store` (the removed `dsh-client-runtime` left it blank and raised a DSH Desktop Safe Mode warning), writes through `remote.credentials` so Save works, refreshes on `credentials/reference-updated`, and also renders on 0.1.7's plugin page; peer ranges set to `>=0.1.5-rc.2 <0.3.0-0` so DSH 0.2's installer accepts it (tested on 0.1.5-rc.2, 0.1.7-rc.2 and 0.2.0-rc.1); the probe route is released on plugin reload; the `web` override keeps dsh-base's `fetchProvider: http`; README documents the duplicate `mcp-tavily` row conflict.
- **0.3.0** Settings-card design refresh informed by current UI/a11y guidance (ARIA live regions for async status, `prefers-reduced-motion` support): header mode badge with status dot, spinner states on Test/Save, saved confirmation announcement, show/hide key toggle. Server provider adopts the latest Tavily Search API surface behind opt-in config: `searchDepth` including the new `fast` tier, and `auto_parameters`.
- **0.2.0** MCP bridge: keyless mode via `X-Tavily-Access-Mode: keyless` (row always on); keyed auth moved from URL query parameter to `Authorization: Bearer` header. Search provider: caller cancellation preserved on runtimes without `AbortSignal.any`.
- **0.1.0** First release as `@pymodel/dsh-tavily`. Web search provider with settings toggle (off = official DeepSeek, on = Tavily) plus a Tavily MCP bridge (extract / crawl / map). English-only localisation.

---

## Author

**[elkaix](https://github.com/elkaix)** · [pymodel](https://github.com/pymodel)
