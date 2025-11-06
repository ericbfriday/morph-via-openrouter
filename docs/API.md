# API Documentation

## Overview

The Morph MCP OpenRouter Server provides a REST API for proxying Morph "fast apply" code editing requests to OpenRouter's hosted Morph models. The server handles both standard JSON responses and streaming SSE responses.

## Base URL

```
http://localhost:3333
```

(configurable via `PORT` env var or `--port` CLI flag)

## Authentication

The server itself does not require authentication. However, it requires a valid OpenRouter API key to be configured via:
- `MORPH_API_KEY` environment variable, or
- `--api-key` CLI flag

The server forwards this key to OpenRouter using the `Authorization: Bearer <key>` header.

## Endpoints

### POST /edit_file

Apply code edits to a target file using Morph models.

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target_file` | string | Yes | Relative or absolute path to the file to edit. Resolved relative to `process.cwd()` |
| `instructions` | string | Yes | Natural language instructions describing the desired changes |
| `editSnippet` | string | Yes | Code snippet showing the location/context for the edit |
| `stream` | boolean | No | If `true`, returns a streaming response. Default: `false` |

#### Request Example (Non-Streaming)

```json
{
  "target_file": "src/example.ts",
  "instructions": "Update the function to use async/await instead of promises",
  "editSnippet": "function fetchData() {\n  return fetch('/api/data').then(res => res.json());\n}",
  "stream": false
}
```

#### Response (Non-Streaming)

**Status Code:** `200 OK`

**Response Headers:**
```
Content-Type: application/json
```

**Response Body:**

| Field | Type | Description |
|-------|------|-------------|
| `updatedCode` | string | Complete updated file contents after applying the edit |
| `model` | string | Model identifier used (e.g., `morph/morph-v2`) |
| `usage` | object | Token usage statistics (optional) |
| `usage.prompt_tokens` | number | Number of tokens in the prompt |
| `usage.completion_tokens` | number | Number of tokens in the completion |
| `usage.total_tokens` | number | Total tokens used |

**Response Example:**

```json
{
  "updatedCode": "async function fetchData() {\n  const res = await fetch('/api/data');\n  return res.json();\n}",
  "model": "morph/morph-v2",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

#### Request Example (Streaming)

```json
{
  "target_file": "src/example.ts",
  "instructions": "Add error handling with try/catch",
  "editSnippet": "async function fetchData() {\n  const res = await fetch('/api/data');\n  return res.json();\n}",
  "stream": true
}
```

#### Response (Streaming)

**Status Code:** `200 OK`

**Response Headers:**
```
Content-Type: text/event-stream
Connection: keep-alive
Cache-Control: no-cache
Transfer-Encoding: chunked
```

**Response Format:**

The server forwards OpenRouter's Server-Sent Events (SSE) stream directly to the client. Each chunk follows the SSE format:

```
data: {"id":"...","choices":[{"delta":{"content":"async "}}],...}

data: {"id":"...","choices":[{"delta":{"content":"function "}}],...}

data: [DONE]
```

Clients should parse each `data:` line as JSON and accumulate the `delta.content` values to reconstruct the complete updated code.

#### Error Response

**Status Code:** `400 Bad Request`

**Response Body:**

```json
{
  "error": "Invalid or missing field: instructions"
}
```

**Common Error Messages:**

- `"Invalid payload. Expected object."` - Request body is not a valid JSON object
- `"Invalid or missing field: target_file"` - Required field missing or empty
- `"Invalid or missing field: instructions"` - Required field missing or empty
- `"Invalid or missing field: editSnippet"` - Required field missing or empty
- `"Malformed JSON body"` - Request body is not valid JSON
- `"ENOENT: no such file or directory"` - Target file does not exist
- `"Morph API error (401): ..."` - Invalid API key or authentication failure
- `"Morph API returned an empty completion"` - Model returned empty response

**Status Code:** `500 Internal Server Error`

**Response Body:**

```json
{
  "error": "Internal server error"
}
```

---

### GET /health

Health check endpoint for monitoring server status.

#### Request

```
GET /health
```

#### Response

**Status Code:** `200 OK`

**Response Headers:**
```
Content-Type: application/json
```

**Response Body:**

```json
{
  "status": "ok"
}
```

---

## Internal Prompt Format

When the server receives an edit request, it constructs a prompt for the Morph model using this format:

**System Message:**
```
You are Morph fast apply. Carefully update the provided code according to the instructions and edit snippet. Return ONLY the full updated file contents with no commentary.
```

**User Message:**
```
<code>
{complete file contents}
</code>
<update>
{instructions}

{editSnippet}
</update>
```

This format is critical for Morph models to correctly interpret the editing task.

---

## OpenRouter Integration

The server forwards requests to OpenRouter's `/chat/completions` endpoint with the following configuration:

**Endpoint:** `{MORPH_BASE_URL}/chat/completions`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {MORPH_API_KEY}`
- `HTTP-Referer: {OPENROUTER_REFERRER}` (optional, for analytics)
- `X-Title: {OPENROUTER_TITLE}` (optional, for analytics)

**Request Body:**
```json
{
  "model": "morph/morph-v2",
  "messages": [
    {
      "role": "system",
      "content": "You are Morph fast apply..."
    },
    {
      "role": "user",
      "content": "<code>...</code><update>...</update>"
    }
  ],
  "stream": false
}
```

---

## Rate Limits & Quotas

Rate limits are determined by your OpenRouter account and the specific Morph model being used. Refer to [OpenRouter documentation](https://openrouter.ai/docs) for current limits.

---

## Error Handling

The server provides detailed error messages for common failure scenarios:

1. **Configuration Errors** (startup failures):
   - Missing API key
   - Invalid port number
   - Invalid base URL format

2. **Request Validation Errors** (400 responses):
   - Missing required fields
   - Invalid JSON payload
   - Empty or whitespace-only field values

3. **File System Errors** (400 responses):
   - Target file not found
   - Permission denied reading file
   - File path traversal outside working directory

4. **API Errors** (forwarded from OpenRouter):
   - Authentication failures (401)
   - Model not found (404)
   - Rate limit exceeded (429)
   - OpenRouter service errors (5xx)

5. **Server Errors** (500 responses):
   - Unhandled exceptions
   - Stream processing failures

---

## Examples

### cURL Example (Non-Streaming)

```bash
curl -X POST http://localhost:3333/edit_file \
  -H "Content-Type: application/json" \
  -d '{
    "target_file": "src/utils.ts",
    "instructions": "Add JSDoc comments to the exported function",
    "editSnippet": "export function parseConfig(input: string) {\n  return JSON.parse(input);\n}",
    "stream": false
  }'
```

### cURL Example (Streaming)

```bash
curl -X POST http://localhost:3333/edit_file \
  -H "Content-Type: application/json" \
  -N \
  -d '{
    "target_file": "src/utils.ts",
    "instructions": "Add error handling for invalid JSON",
    "editSnippet": "export function parseConfig(input: string) {\n  return JSON.parse(input);\n}",
    "stream": true
  }'
```

### Node.js Example (Non-Streaming)

```javascript
const response = await fetch('http://localhost:3333/edit_file', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target_file: 'src/utils.ts',
    instructions: 'Add type validation before parsing',
    editSnippet: 'export function parseConfig(input: string) {\n  return JSON.parse(input);\n}',
    stream: false
  })
});

const result = await response.json();
console.log(result.updatedCode);
```

### Node.js Example (Streaming)

```javascript
const response = await fetch('http://localhost:3333/edit_file', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target_file: 'src/utils.ts',
    instructions: 'Add comprehensive error handling',
    editSnippet: 'export function parseConfig(input: string) {\n  return JSON.parse(input);\n}',
    stream: true
  })
});

// Process SSE stream
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

  for (const line of lines) {
    const data = line.slice(6); // Remove 'data: ' prefix
    if (data === '[DONE]') break;

    const parsed = JSON.parse(data);
    const content = parsed.choices?.[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  }
}
```

---

## See Also

- [Configuration Guide](./CONFIGURATION.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
