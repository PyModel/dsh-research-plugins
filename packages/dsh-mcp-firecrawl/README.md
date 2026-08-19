# dsh-mcp-firecrawl

[Firecrawl](https://www.firecrawl.dev/) MCP for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Connects the official hosted Firecrawl MCP server through the harness's `@deepseek-ai/dsh-mcp-client` bridge and exposes its tools as `mcp__firecrawl__*` — scrape, crawl, map, and search.

## Install

```sh
dsh plugin --profile web add dsh-mcp-firecrawl
dsh web
```

Or follow GitHub (latest commit):

```sh
dsh plugin --profile web add github:pymodel/dsh-research-plugins#path:packages/dsh-mcp-firecrawl
```

## API key

The hosted server requires a Firecrawl API key. Get one at [firecrawl.dev](https://www.firecrawl.dev/) (format `fc-...`), then make it visible to the launch environment in one of:

```sh
export FIRECRAWL_API_KEY=fc-...
```

or a project `.env` / `$DSH_HOME/.env`:

```
FIRECRAWL_API_KEY=fc-...
```

The MCP row is disabled automatically when the key is absent, so no half-working tools appear. A key added to `.env` needs a `dsh web` restart to take effect.

## Tools

After the key is set, the model sees the Firecrawl tools under the `firecrawl` namespace (for example `mcp__firecrawl__firecrawl_scrape`, `mcp__firecrawl__firecrawl_crawl`, `mcp__firecrawl__firecrawl_map`, `mcp__firecrawl__firecrawl_search`).

## Remove

```sh
dsh plugin --profile web remove dsh-mcp-firecrawl
```

Do not commit real keys. If you already run your own Firecrawl MCP row, remove it first to avoid a duplicate `serverName` conflict.
