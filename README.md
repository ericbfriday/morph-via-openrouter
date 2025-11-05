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
