# Morph MCP OpenRouter Server

Local MCP server that proxies Morph "fast apply" requests to the Morph models hosted on OpenRouter. Configure it with `MORPH_API_KEY`, choose your base URL and model, then run the CLI or import the server helpers in your own tooling.

## Quick start

```bash
npm install
npm run build
MORPH_API_KEY=sk-... npx morph-mcp-server
```

The build step uses [`tsdown`](https://www.npmjs.com/package/tsdown) to emit both ESM and CJS bundles under `dist/`, so the package is ready to run via `npx` or consume through either module system. Place a `.env` file in the workspace (or point to an alternate file with `MORPH_ENV_PATH`) to have configuration picked up automatically.

The server exposes an `/edit_file` endpoint that accepts JSON payloads:

```json
{
  "target_file": "src/example.ts",
  "instructions": "Update the function to use async/await",
  "editSnippet": "function fetchData() {\n  // ... existing code ...\n}",
  "stream": false
}
```

Set `"stream": true` in the payload to request a streaming response (text/event-stream format).

The server responds with (non-streaming):
```json
{
  "updatedCode": "async function fetchData() {\n  // ... updated code ...\n}",
  "model": "morph/morph-v2",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

## Configuration

Add `--port`, `--model`, `--base-url`, or `--api-key` CLI flags to override defaults:
- Default port: `3333` (or `PORT` env var)
- Default base URL: `https://openrouter.ai/api/v1` (or `MORPH_BASE_URL` env var)
- Default model: `morph/morph-v2` (or `MORPH_MODEL` env var)
- API key: required via `MORPH_API_KEY` env var or `--api-key` flag
- Optional: `LOG_LEVEL` env var for logging verbosity (debug, info, warn, error)

A `GET /health` endpoint is also available for readiness checks.

## Claude Code Integration

This repository includes Claude Code configuration to enforce best practices and enable MCP server integration.

### Superclaude Plugin Requirement

**Important**: This repository requires the [SuperClaude plugin](https://github.com/SuperClaude-Org/SuperClaude_Plugin) for Claude Code.

SuperClaude is a third-party, open-source framework that provides:
- 19+ specialized development commands (build, analyze, optimize, review, audit, etc.)
- 9 expert personas for domain-specific guidance
- Enhanced code editing and workflow automation capabilities

**Installation** (choose one method):
```bash
# Via Claude Code Marketplace (recommended)
/plugin marketplace add SuperClaude-Org/SuperClaude_Plugin
/plugin install sc@superclaude-official

# Via pip
pip install SuperClaude

# Via npm
npm install -g @bifrost_inc/superclaude
```

See [`.claude/CLAUDE_CODE.md`](./.claude/CLAUDE_CODE.md) for detailed installation instructions and plugin information.

The `.claude/settings.json` file enforces this requirement to ensure consistent tooling across all contributors.

### MCP Servers Configuration

The `.claude/mcp.json` file configures MCP servers for use with Claude Code:

- **morph-openrouter**: The local server (the project itself) for Morph fast apply requests
- **filesystem**: Standard MCP filesystem server for file operations
- **git**: Standard MCP git server for repository operations

To use these MCP servers with Claude Code:

1. Copy `.env.example` to `.env` and fill in your OpenRouter API key
2. Run `npm install && npm run build` to build the project
3. Open the project in Claude Code - the MCP servers will be available based on the configuration

Environment variables referenced in `.claude/mcp.json` are automatically sourced from your `.env` file.
