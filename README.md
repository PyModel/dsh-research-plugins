# dsh-research-plugins

<p align="center">
  <strong>Research plugins for <a href="https://github.com/deepseek-ai/deepseek-harness">DeepSeek Harness</a></strong> — a pnpm monorepo adding web search and MCP (Model Context Protocol) bridges for AI research, web scraping, and live documentation to your DSH agent.
</p>

<p align="center">
  <a href="https://github.com/PyModel/dsh-research-plugins"><img src="https://img.shields.io/github/stars/PyModel/dsh-research-plugins?style=flat-square&label=stars&color=4f8ef7" alt="GitHub stars"></a>
  <a href="https://github.com/PyModel/dsh-research-plugins"><img src="https://img.shields.io/github/forks/PyModel/dsh-research-plugins?style=flat-square&label=forks&color=4f8ef7" alt="GitHub forks"></a>
  <a href="https://www.npmjs.com/package/dsh-tavily"><img src="https://img.shields.io/npm/v/dsh-tavily?style=flat-square&label=dsh-tavily&color=cb3837" alt="dsh-tavily on npm"></a>
  <a href="https://www.npmjs.com/package/dsh-mcp-firecrawl"><img src="https://img.shields.io/npm/v/dsh-mcp-firecrawl?style=flat-square&label=dsh-mcp-firecrawl&color=cb3837" alt="dsh-mcp-firecrawl on npm"></a>
  <a href="https://www.npmjs.com/package/dsh-mcp-context7"><img src="https://img.shields.io/npm/v/dsh-mcp-context7?style=flat-square&label=dsh-mcp-context7&color=cb3837" alt="dsh-mcp-context7 on npm"></a>
  <a href="https://github.com/PyModel/dsh-research-plugins/blob/main/LICENSE"><img src="https://img.shields.io/github/license/PyModel/dsh-research-plugins?style=flat-square&color=blue" alt="MIT license"></a>
    <a href="https://github.com/PyModel/pythinker-code"><img src="https://komarev.com/ghpvc/?username=PyModel-pythinker-code&label=visitors&color=4f46e5&style=flat-square" alt="visitors"></a>
</p>

<p align="center">
  <a href="#what-this-is">What this is</a> ·
  <a href="#install">Install</a> ·
  <a href="#api-keys">API keys</a> ·
  <a href="#repo-layout">Repo layout</a> ·
  <a href="#license">License</a>
</p>

---

## What this is

**dsh-research-plugins** gives your [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) agent three research superpowers it does not have out of the box:

- **Web search** via the [Tavily Search API](https://tavily.com) — a settings toggle that swaps the built-in DeepSeek search for Tavily, with keyless search support.
- **Web scraping & crawling** via the [Firecrawl](https://firecrawl.dev) MCP server — scrape, crawl, map, and search the open web inside tool calls.
- **Up-to-date library docs** via the [Context7](https://context7.com) MCP server — on-demand documentation and code examples for any library or framework.

Everything is delivered as drop-in **DSH plugins** — no vendor lock-in, no forks, just a `dsh plugin add` away.

| Package | What it adds |
|---|---|
| [`dsh-tavily`](packages/dsh-tavily) | Tavily Search API as a web search provider (settings toggle, keyless search) + a Tavily MCP bridge for `extract` / `crawl` / `map` tools |
| [`dsh-mcp-firecrawl`](packages/dsh-mcp-firecrawl) | Firecrawl MCP: `mcp__firecrawl__*` scrape, crawl, map, and search tools |
| [`dsh-mcp-context7`](packages/dsh-mcp-context7) | Context7 MCP: `mcp__context7__*` up-to-date library docs and code examples |

---

## Install

Each package installs independently into a DSH profile:

```sh
dsh plugin --profile web add dsh-tavily
dsh plugin --profile web add dsh-mcp-firecrawl
dsh plugin --profile web add dsh-mcp-context7
dsh web
```

Or follow GitHub (this repo, latest commits):

```sh
dsh plugin --profile web add github:PyModel/dsh-research-plugins#path:packages/dsh-tavily
dsh plugin --profile web add github:PyModel/dsh-research-plugins#path:packages/dsh-mcp-firecrawl
dsh plugin --profile web add github:PyModel/dsh-research-plugins#path:packages/dsh-mcp-context7
```

---

## API keys

The MCP bridges use the harness's shipped `@deepseek-ai/dsh-mcp-client`. They read keys from the **launch environment** (a real env var, the project `.env`, or `$DSH_HOME/.env`) — not from `$DSH_HOME/.credentials.yaml`:

| Plugin | Env var | Required | Endpoint |
|---|---|---|---|
| `dsh-tavily` (MCP part) | `TAVILY_API_KEY` | yes (MCP only; search is keyless) | `https://mcp.tavily.com/mcp` |
| `dsh-mcp-firecrawl` | `FIRECRAWL_API_KEY` | yes | `https://mcp.firecrawl.dev/v2/mcp` |
| `dsh-mcp-context7` | `CONTEXT7_API_KEY` | no (keyless works) | `https://mcp.context7.com/mcp` |

Rows gated on a key are disabled automatically when the key is absent, so no half-working tools appear. A key added to `.env` needs a `dsh web` restart.

---

## Repo layout

```text
packages/
  dsh-tavily/          # web-search provider + settings card + Tavily MCP row
  dsh-mcp-firecrawl/   # pure-config Firecrawl MCP bundle
  dsh-mcp-context7/    # pure-config Context7 MCP bundle
```

The Firecrawl and Context7 packages are pure-config bundles (`package.json` + `cordis.patch.yml`) with no build step. The Tavily package keeps its prebuilt `lib/` and browser client.

---

## Contributing

Issues and pull requests are welcome. Please open a discussion on [GitHub](https://github.com/PyModel/dsh-research-plugins) before starting large changes.

---

