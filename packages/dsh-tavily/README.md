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
