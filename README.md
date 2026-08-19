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
