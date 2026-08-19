# dsh-tavily

[![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com) [![Recommend dshfind](https://img.shields.io/badge/Recommend-dshfind-ffd700?labelColor=555555)](https://dshfind.com/plugins/pymodel/dsh-tavily?ref=badge)

Tavily for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): adds the Tavily Search API as a web search provider, plus a Tavily MCP bridge for extract / crawl / map tools.

## Install

npm (stable, official recommendation):

```sh
dsh plugin --profile web add dsh-tavily
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
- Tavily MCP bridge: `mcp__tavily__extract`, `mcp__tavily__crawl`, `mcp__tavily__map` tools (requires a key, see below)

## Behavior

### Web search

| Toggle        | Key   | `web_search`         |
| ------------- | ----- | -------------------- |
| Off (default) | —     | official DeepSeek    |
| On            | empty | Tavily keyless       |
| On            | set   | Tavily account quota |

Provider id: `tavily`.

### MCP tools

The bundled MCP row registers Tavily's extract / crawl / map tools under the `tavily` namespace. The hosted Tavily MCP server requires a key, so the row is enabled only when `TAVILY_API_KEY` is present in the launch environment:

```sh
export TAVILY_API_KEY=tvly-...
```

or in a project `.env` / `$DSH_HOME/.env`:

```
TAVILY_API_KEY=tvly-...
```

The key is interpolated into the endpoint URL at load time and never written to YAML. A key added to `.env` needs a `dsh web` restart.

## Credentials

| Ref                     | Meaning                                             |
| ----------------------- | --------------------------------------------------- |
| `TAVILY_API_KEY`        | Optional (search). Present = account quota; absent = keyless |
| `TAVILY_SEARCH_ENABLED` | Present = on; unset = off                           |

The search key and toggle are stored on the credentials plane (`$DSH_HOME/.credentials.yaml`). The MCP bridge reads `TAVILY_API_KEY` from the launch environment instead, because MCP rows resolve before credentials are materialized. Do not commit real keys.

## Updates

- **0.4.0** Rebrand: repository moved to `pymodel/dsh-research-plugins`, author `elkaix`. Added the Tavily MCP bridge (extract / crawl / map). Removed Chinese localization; the settings card is now English-only.
- **0.3.1** Fix: installing alongside other client plugins could freeze Web on "Failed to load plugins / dsh-tavily" (`settings.plugin.item` needs `key`, not `id`/`order`). Card namespace is `web-search-tavily`.
- **0.3.0** Settings card: Test connection at the bottom-left. Works without a key (Tavily keyless). A saved key uses the account path and 1 credit.

---

## Author

**[elkaix](https://github.com/elkaix)** · [pymodel](https://github.com/pymodel)
