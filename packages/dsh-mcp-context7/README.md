# dsh-mcp-context7

[Context7](https://context7.com/) MCP for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). Connects the Context7 MCP server through the harness's `@deepseek-ai/dsh-mcp-client` bridge and exposes its tools as `mcp__context7__*`, giving the model up-to-date, version-specific library documentation and code examples.

## Install

```sh
dsh plugin --profile web add dsh-mcp-context7
dsh web
```

Or follow GitHub (latest commit):

```sh
dsh plugin --profile web add github:pymodel/dsh-research-plugins#path:packages/dsh-mcp-context7
```

## API key (optional)

Context7 works without a key. For higher rate limits, get a key at [context7.com](https://context7.com/) and expose it as an env var or in a `.env` file:

```
CONTEXT7_API_KEY=...
```

The row stays enabled either way; an empty key simply means keyless.

## Tools

The model sees the Context7 tools under the `context7` namespace (for example `mcp__context7__resolve-library-id` and `mcp__context7__query-docs`).

## Remove

```sh
dsh plugin --profile web remove dsh-mcp-context7
```

Do not commit real keys. If you already run your own Context7 MCP row, remove it first to avoid a duplicate `serverName` conflict.
