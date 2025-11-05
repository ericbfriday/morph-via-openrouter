# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a local MCP (Model Context Protocol) server that proxies Morph "fast apply" requests to Morph models hosted on OpenRouter. It acts as a bridge between MCP clients and the OpenRouter API, enabling local file editing via Morph's code editing capabilities.

## Architecture

### Core Components

- **src/cli.ts**: CLI entrypoint that uses Commander.js for argument parsing and delegates to server startup
- **src/server.ts**: HTTP server using Node's built-in `http` module with routing for `/edit_file` (POST) and `/health` (GET) endpoints
- **src/handler.ts**: Request handler that validates payloads, reads target files, builds prompts, and orchestrates responses (both streaming and non-streaming)
- **src/morphClient.ts**: HTTP client for OpenRouter API at `/chat/completions` endpoint with support for both standard and streaming responses
- **src/config.ts**: Configuration resolver that merges CLI flags with environment variables and applies defaults
- **src/types.ts**: TypeScript interfaces for requests, responses, and configurations
- **src/env.ts**: Dotenv loader (loaded first in CLI entrypoint)
- **src/logger.ts**: Logging utility

### Request Flow

1. Client POSTs to `/edit_file` with `{ target_file, instructions, editSnippet, stream? }`
2. Handler validates the payload and reads the target file from disk (resolved relative to `process.cwd()`)
3. Handler constructs a prompt in format: `<code>{fileContent}</code>\n<update>{instructions}\n\n{editSnippet}</update>`
4. MorphClient sends this to OpenRouter's `/chat/completions` with system prompt instructing the model to return only the full updated file contents
5. Response is either returned as JSON (non-streaming) or as text/event-stream (streaming)

### Prompt Format

The system uses a specific prompt structure in src/handler.ts:83-84:
- System message: "You are Morph fast apply. Carefully update the provided code according to the instructions and edit snippet. Return ONLY the full updated file contents with no commentary."
- User message: `<code>\n{fileContent}\n</code>\n<update>\n{instructions}\n\n{editSnippet}\n</update>`

This format is critical for Morph models to understand the task.

## Development Commands

```bash
# Install dependencies
npm install

# Build the project (outputs to dist/)
npm run build

# Clean build artifacts
npm run clean

# Run tests
npm test

# Start the server locally (requires .env or MORPH_API_KEY)
npm start

# Or run directly after building
MORPH_API_KEY=sk-... node dist/cli.js

# Or via npx after building
MORPH_API_KEY=sk-... npx morph-mcp-server
```

## Configuration

The server is configured via environment variables or CLI flags (in src/config.ts):

- `MORPH_API_KEY` (required): OpenRouter API key
- `MORPH_BASE_URL` (default: `https://openrouter.ai/api/v1`): Base URL for API
- `MORPH_MODEL` (default: `morph/morph-v2`): Model identifier (e.g., `morph/morph-v2`, `morph/morph-v3-large`)
- `PORT` (default: 3333): Server port
- `LOG_LEVEL` (default: `info`): Logging verbosity level (debug, info, warn, error)
- `OPENROUTER_REFERRER` (optional): Sent as `HTTP-Referer` header for OpenRouter analytics
- `OPENROUTER_TITLE` (optional): Sent as `X-Title` header for OpenRouter analytics
- `MORPH_ENV_PATH` (optional): Path to alternative .env file

CLI flags override environment variables: `--port`, `--base-url`, `--model`, `--api-key`

## Build System

Uses `tsdown` (not tsc) configured in tsdown.config.ts with two separate builds:
1. Library build: `src/index.ts` → `dist/index.js` with type declarations
2. CLI build: `src/cli.ts` → `dist/cli.js` with shebang banner

Both target Node 18+ and emit ESM format only. The CLI build gets a `#!/usr/bin/env node` shebang added automatically.

## Testing

Tests are configured via Vitest (package.json:33) but no test files currently exist in the repository.

## API Endpoints

### POST /edit_file
Accepts JSON payload:
```json
{
  "target_file": "path/to/file.ts",
  "instructions": "What to change",
  "editSnippet": "Code snippet showing the change location",
  "stream": false
}
```

Returns (non-streaming):
```json
{
  "updatedCode": "Full file contents after edit",
  "model": "morph/morph-v2",
  "usage": { "prompt_tokens": 123, "completion_tokens": 456, "total_tokens": 579 }
}
```

Streaming responses use text/event-stream format and forward chunks from OpenRouter.

### GET /health
Returns: `{ "status": "ok" }`

## Important Implementation Details

- The server resolves `target_file` paths relative to `process.cwd()` (src/handler.ts:68)
- File reads use `fs.readFile` with utf-8 encoding
- Streaming uses Node's `Readable.fromWeb()` to convert Web ReadableStream to Node stream
- The MorphClient class handles Authorization header as `Bearer {apiKey}`
- Error responses include the error message in JSON format with appropriate HTTP status codes
- The server uses native Node.js http module (not Express or Fastify)
