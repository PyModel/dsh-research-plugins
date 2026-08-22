# @pymodel/dsh-tavily

[![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com) [![Recommend dshfind](https://img.shields.io/badge/Recommend-dshfind-ffd700?labelColor=555555)](https://dshfind.com/plugins/pymodel/dsh-tavily?ref=badge)

Tavily for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): adds the Tavily Search API as a web search provider, plus a Tavily MCP bridge — keyless `search` / `extract`, `crawl` / `map` with an API key.

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

Settings → Plugins → Plugin settings → **Tavily web search**: turn the toggle on. The key is optional; leave it blank for keyless search. **Test connection** at the bottom-left checks that search works now (including keyless).

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
- Bottom-left connection test: one real Tavily search (`max_results: 1`); keyless if no key, account quota if a key is saved (1 credit)
- Timeout, abort, official host lock, drop results without a url
- Key and toggle live on the credentials plane, not the settings file
- Tavily MCP bridge: `mcp__tavily__tavily-search` / `tavily-extract` work keyless; `crawl` / `map` unlock with `TAVILY_API_KEY`

## Behavior

### Web search

| Toggle        | Key   | `web_search`         |
| ------------- | ----- | -------------------- |
| Off (default) | —     | official DeepSeek    |
| On            | empty | Tavily keyless       |
| On            | set   | Tavily account quota |

Provider id: `tavily`.

### MCP tools

The bundled MCP row registers Tavily's hosted MCP server under the `tavily` namespace and works out of the box:

- Keyless (default): the required `X-Tavily-Access-Mode: keyless` header selects free rate-limited access with the `tavily-search` and `tavily-extract` tools.
- Keyed: set `TAVILY_API_KEY` to unlock `crawl` / `map` and use your account quota:

```sh
export TAVILY_API_KEY=tvly-...
```

or in a project `.env` / `$DSH_HOME/.env`:

```
TAVILY_API_KEY=tvly-...
```

The key goes into the `Authorization: Bearer` header at load time — never into the endpoint URL and never into YAML. A key added to `.env` needs a `dsh web` restart.

## Credentials

| Ref                     | Meaning                                             |
| ----------------------- | --------------------------------------------------- |
| `TAVILY_API_KEY`        | Optional (search). Present = account quota; absent = keyless |
| `TAVILY_SEARCH_ENABLED` | Present = on; unset = off                           |

The search key and toggle are stored on the credentials plane (`$DSH_HOME/.credentials.yaml`). The MCP bridge reads `TAVILY_API_KEY` from the launch environment instead, because MCP rows resolve before credentials are materialized. Do not commit real keys.

## Updates

- **0.2.0** MCP bridge: keyless mode via `X-Tavily-Access-Mode: keyless` (row always on); keyed auth moved from URL query parameter to `Authorization: Bearer` header. Search provider: caller cancellation preserved on runtimes without `AbortSignal.any`.
- **0.1.0** First release as `@pymodel/dsh-tavily`. Web search provider with settings toggle (off = official DeepSeek, on = Tavily) plus a Tavily MCP bridge (extract / crawl / map). English-only localisation.

---

## Author

**[elkaix](https://github.com/elkaix)** · [pymodel](https://github.com/pymodel)
