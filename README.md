# Morph MCP OpenRouter Server

Local MCP server that proxies Morph "fast apply" requests to the Morph models hosted on OpenRouter. Configure it with `MORPH_API_KEY`, choose your base URL and model, then run the CLI or import the server helpers in your own tooling.

## Quick start

```bash
npm install
npm run build
MORPH_API_KEY=sk-... npx morph-openrouter-mcp-server
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

Set `"stream": true` in the payload to request a streaming response. Add `--port`, `--model`, or `--base-url` CLI flags to override defaults. A `GET /health` endpoint is also available for readiness checks.
