# dsh-mcp-firecrawl

[Firecrawl](https://www.firecrawl.dev/) MCP for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Connects the official hosted Firecrawl MCP server through the harness's `@deepseek-ai/dsh-mcp-client` bridge and exposes its tools as `mcp__firecrawl__*`. Works keyless out of the box (`search`, `scrape`, `parse` within daily limits); a Firecrawl API key unlocks the full tool surface — scrape, crawl, map, and more.

## Install

```sh
dsh plugin --profile web add dsh-mcp-firecrawl
dsh web
```

Or follow GitHub (latest commit):

```sh
dsh plugin --profile web add github:pymodel/dsh-research-plugins#path:packages/dsh-mcp-firecrawl
```

## API key (optional)

Keyless needs no setup: the row is always enabled and starts with `firecrawl_search`, `firecrawl_scrape`, and `firecrawl_parse` at daily keyless limits.

For the full tool surface and higher limits, get a Firecrawl API key at [firecrawl.dev](https://www.firecrawl.dev/) (format `fc-...`) and make it visible to the launch environment in one of:

```sh
export FIRECRAWL_API_KEY=fc-...
```

or a project `.env` / `$DSH_HOME/.env`:

```
FIRECRAWL_API_KEY=fc-...
```

The key goes into the `Authorization: Bearer` header at load time — never into the MCP URL and never into YAML. A key added to `.env` needs a `dsh web` restart.

## Tools

After connecting, the model sees the Firecrawl tools under the `firecrawl` namespace: `mcp__firecrawl__firecrawl_search`, `mcp__firecrawl__firecrawl_scrape`, and `mcp__firecrawl__firecrawl_parse` keyless, plus the full surface such as `mcp__firecrawl__firecrawl_crawl` and `mcp__firecrawl__firecrawl_map` once an API key is set.

## Remove

```sh
dsh plugin --profile web remove dsh-mcp-firecrawl
```

Do not commit real keys. If you already run your own Firecrawl MCP row, remove it first to avoid a duplicate `serverName` conflict.
