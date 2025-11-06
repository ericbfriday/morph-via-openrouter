# Architecture Documentation

## System Overview

The Morph MCP OpenRouter Server is a lightweight HTTP proxy service that bridges MCP (Model Context Protocol) clients with Morph code editing models hosted on OpenRouter. It provides a simple REST API for file editing operations while handling the complexity of prompt construction, file I/O, and API communication.

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────┐
│ MCP Client  │────────>│  Morph MCP       │────────>│  OpenRouter  │
│             │  HTTP   │  Server          │  HTTPS  │  API         │
│             │<────────│  (This Project)  │<────────│              │
└─────────────┘         └──────────────────┘         └──────────────┘
                               │
                               │ File I/O
                               ▼
                        ┌──────────────┐
                        │  Local File  │
                        │  System      │
                        └──────────────┘
```

---

## Design Principles

1. **Simplicity**: Use Node.js built-in modules (http, fs, stream) over heavy frameworks
2. **Transparency**: Forward OpenRouter responses directly with minimal transformation
3. **Configurability**: Support both environment variables and CLI flags for flexibility
4. **Reliability**: Comprehensive error handling with informative error messages
5. **Streaming Support**: Efficient real-time streaming for long responses
6. **Type Safety**: Full TypeScript coverage with explicit interfaces

---

## Module Architecture

### Module Dependency Graph

```
cli.ts (entry point)
  ├─> env.ts (dotenv loader)
  ├─> config.ts (configuration resolver)
  ├─> server.ts (HTTP server)
  │     ├─> handler.ts (request handler)
  │     │     ├─> morphClient.ts (OpenRouter client)
  │     │     └─> types.ts (TypeScript interfaces)
  │     └─> logger.ts (logging utility)
  └─> logger.ts
```

### Core Modules

#### 1. cli.ts (Entry Point)
**Location:** `src/cli.ts`
**Purpose:** CLI interface and application bootstrap

**Key Responsibilities:**
- Parse command-line arguments using Commander.js
- Load environment variables via `env.ts`
- Resolve configuration from CLI flags and environment
- Start HTTP server
- Handle top-level errors and set process exit codes

**Exports:**
- None (executable entry point)

**Dependencies:**
- `commander` for CLI parsing
- `env.js` for environment setup
- `config.js` for configuration resolution
- `server.js` for server startup
- `logger.js` for logging

---

#### 2. env.ts (Environment Loader)
**Location:** `src/env.ts`
**Purpose:** Load environment variables from .env file

**Key Responsibilities:**
- Load dotenv configuration from default or custom path
- Set `MORPH_ENV_PATH` for alternative .env file locations
- Execute before any other module imports

**Exports:**
- None (side effects only)

**Dependencies:**
- `dotenv` package

**Configuration:**
- Respects `MORPH_ENV_PATH` environment variable
- Defaults to `.env` in current working directory

---

#### 3. config.ts (Configuration Resolver)
**Location:** `src/config.ts`
**Purpose:** Merge and validate configuration from multiple sources

**Key Responsibilities:**
- Merge CLI flags with environment variables
- Apply default values for optional settings
- Validate required fields (e.g., API key)
- Sanitize and validate base URLs
- Throw `ConfigError` for invalid configuration

**Exports:**
- `resolveConfig(input?: PartialConfig): ServerConfig`
- `ConfigError` class
- `PartialConfig` interface

**Configuration Priority:**
1. CLI flags (highest priority)
2. Environment variables
3. Default values (lowest priority)

**Defaults:**
```typescript
DEFAULT_PORT = 3333
DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'
DEFAULT_MODEL = 'morph/morph-v2'
```

**Validation:**
- API key: Required, non-empty string
- Port: Positive integer
- Base URL: Valid URL format, trailing slash removed

---

#### 4. server.ts (HTTP Server)
**Location:** `src/server.ts`
**Purpose:** HTTP server implementation and request routing

**Key Responsibilities:**
- Create Node.js HTTP server using `http.createServer()`
- Route requests to appropriate handlers
- Parse incoming JSON request bodies
- Handle both streaming and non-streaming responses
- Send standardized JSON error responses
- Manage server lifecycle (listen, shutdown)

**Exports:**
- `startServer(config: ServerConfig): Promise<Server>`

**Routes:**
- `POST /edit_file` → `handleStandardEdit()` or `handleStreamingEdit()`
- `GET /health` → `{ status: 'ok' }`
- All other routes → 404 error

**Response Handling:**
- Standard responses: `sendJson()` helper with Content-Length
- Streaming responses: Server-Sent Events with `pipeline()` from stream/promises
- Error responses: JSON format with appropriate HTTP status codes

**Implementation Details:**
- Uses `readRequestBody()` to collect request body chunks
- Validates JSON parsing and returns 400 for malformed JSON
- Delegates edit logic to `handler.ts`
- Uses `pipeline()` for proper stream cleanup and error propagation

---

#### 5. handler.ts (Request Handler)
**Location:** `src/handler.ts`
**Purpose:** Business logic for edit requests

**Key Responsibilities:**
- Validate request payloads (required fields, types, non-empty)
- Read target files from disk using `fs.readFile()`
- Construct Morph-specific prompt format
- Delegate to `MorphClient` for API communication
- Extract completion text from API response
- Return structured `EditFileResponse` or `Readable` stream

**Exports:**
- `handleEditRequest(config, payload): Promise<EditFileResponse>`
- `handleEditStream(config, payload): Promise<Readable>`

**Functions:**

##### validatePayload()
- Checks for object type
- Validates presence of `target_file`, `instructions`, `editSnippet`
- Ensures all required fields are non-empty strings
- Throws descriptive errors for validation failures

##### readFileSafely()
- Resolves file path relative to `process.cwd()`
- Uses `path.resolve()` for safe path handling
- Reads file as UTF-8
- Throws Node.js file system errors (ENOENT, EACCES, etc.)

##### buildCompletionRequest()
- Constructs system message with Morph fast apply instructions
- Builds user message in `<code>...</code><update>...</update>` format
- Sets model from configuration
- Configures streaming flag

**Prompt Format:**
```
System: "You are Morph fast apply. Carefully update the provided code
         according to the instructions and edit snippet. Return ONLY
         the full updated file contents with no commentary."

User: "<code>
       {full file contents}
       </code>
       <update>
       {instructions}

       {editSnippet}
       </update>"
```

**Error Handling:**
- Validation errors → thrown to caller (400 in server.ts)
- File I/O errors → thrown to caller (400 in server.ts)
- API errors → thrown from MorphClient (400 in server.ts)
- Empty completions → throws `"Morph API returned an empty completion"`

---

#### 6. morphClient.ts (OpenRouter Client)
**Location:** `src/morphClient.ts`
**Purpose:** HTTP client for OpenRouter API

**Key Responsibilities:**
- Send chat completion requests to OpenRouter
- Handle both standard and streaming responses
- Add authentication headers (Bearer token)
- Add optional analytics headers (Referer, X-Title)
- Convert Web ReadableStream to Node.js Readable for streaming

**Exports:**
- `MorphClient` class

**Methods:**

##### complete(request)
- Sends POST request to `/chat/completions`
- Returns parsed `MorphChatCompletionResponse`
- Throws descriptive error with status code on failure

##### stream(request)
- Sends POST request with `stream: true`
- Returns Node.js `Readable` stream
- Uses `Readable.fromWeb()` to convert Web stream
- Throws descriptive error if streaming not supported

##### performRequest() (private)
- Constructs full endpoint URL from base URL
- Builds headers with authentication and analytics
- Uses native `fetch()` API (Node 18+)
- Returns raw `Response` object

**Headers:**
- `Content-Type: application/json` (always)
- `Authorization: Bearer {apiKey}` (always)
- `HTTP-Referer: {OPENROUTER_REFERRER}` (if env var set)
- `X-Title: {OPENROUTER_TITLE}` (if env var set)

**Endpoint Construction:**
```typescript
base = config.baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
endpoint = new URL('chat/completions', base)
```

**Error Messages:**
- Non-streaming: `"Morph API error ({status}): {body}"`
- Streaming: `"Morph API stream error ({status}): {body}"`

---

#### 7. types.ts (Type Definitions)
**Location:** `src/types.ts`
**Purpose:** TypeScript interfaces for type safety

**Key Interfaces:**

##### EditFileRequest
Request payload for `/edit_file` endpoint.
```typescript
{
  target_file: string;    // Path to file
  instructions: string;   // Edit instructions
  editSnippet: string;    // Code context
  stream?: boolean;       // Streaming mode
}
```

##### EditFileResponse
Response from non-streaming edit requests.
```typescript
{
  updatedCode: string;    // Full updated file
  model: string;          // Model identifier
  usage?: MorphUsage;     // Token statistics
}
```

##### MorphUsage
Token usage statistics from OpenRouter.
```typescript
{
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}
```

##### ServerConfig
Resolved server configuration.
```typescript
{
  port: number;           // Server port
  apiKey: string;         // OpenRouter API key
  baseUrl: string;        // API base URL
  model: string;          // Model identifier
}
```

##### MorphChatCompletionRequest
Request format for OpenRouter API.
```typescript
{
  model: string;
  messages: Array<MorphMessage>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}
```

##### MorphMessage
Chat message format.
```typescript
{
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

##### MorphChatCompletionResponse
Response format from OpenRouter (non-streaming).
```typescript
{
  id: string;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string | null;
    message: {
      role: 'assistant';
      content: string;
    };
  }>;
  usage?: MorphUsage;
}
```

---

#### 8. logger.ts (Logging Utility)
**Location:** `src/logger.ts`
**Purpose:** Centralized logging with configurable levels

**Key Responsibilities:**
- Provide leveled logging (debug, info, warn, error)
- Format log messages consistently
- Respect `LOG_LEVEL` environment variable
- Output to stdout (info, debug) and stderr (warn, error)

**Exports:**
- `logger` object with methods: `debug()`, `info()`, `warn()`, `error()`

**Configuration:**
- `LOG_LEVEL` env var: `debug`, `info`, `warn`, `error`
- Default: `info`

**Usage:**
```typescript
logger.info('Server started', { port: 3333 });
logger.error('Failed to parse JSON', error);
logger.debug('Request details', { method, path });
```

---

## Request Flow (Non-Streaming)

```
1. Client sends POST /edit_file
   └─> server.ts:routeRequest()

2. Parse and validate JSON body
   └─> server.ts:readRequestBody()

3. Delegate to handler
   └─> handler.ts:handleEditRequest()

4. Validate payload fields
   └─> handler.ts:validatePayload()

5. Read target file from disk
   └─> handler.ts:readFileSafely()

6. Build completion request with prompt
   └─> handler.ts:buildCompletionRequest()

7. Send to OpenRouter API
   └─> morphClient.ts:complete()
   └─> morphClient.ts:performRequest()

8. Parse JSON response
   └─> Extract message.content

9. Return formatted response
   └─> EditFileResponse { updatedCode, model, usage }

10. Server sends JSON response
    └─> server.ts:sendJson()
```

---

## Request Flow (Streaming)

```
1. Client sends POST /edit_file with stream: true
   └─> server.ts:routeRequest()

2. Parse and validate JSON body
   └─> server.ts:readRequestBody()

3. Delegate to streaming handler
   └─> handler.ts:handleEditStream()

4. Validate payload fields
   └─> handler.ts:validatePayload()

5. Read target file from disk
   └─> handler.ts:readFileSafely()

6. Build completion request with stream: true
   └─> handler.ts:buildCompletionRequest()

7. Send to OpenRouter API
   └─> morphClient.ts:stream()
   └─> morphClient.ts:performRequest()

8. Convert Web stream to Node stream
   └─> Readable.fromWeb()

9. Return Node.js Readable stream

10. Server pipes stream to response
    └─> server.ts:pipeline(stream, res)

11. Client receives SSE chunks in real-time
```

---

## Data Flow Diagram

```
┌────────────────┐
│  Client        │
│  Request       │
└───────┬────────┘
        │ POST /edit_file
        │ { target_file, instructions, editSnippet }
        ▼
┌────────────────┐
│  HTTP Server   │
│  (server.ts)   │
└───────┬────────┘
        │ JSON payload
        ▼
┌────────────────┐
│  Handler       │
│  (handler.ts)  │
└───────┬────────┘
        │
        ├─> Read file from disk
        │   (fs.readFile)
        │
        ├─> Build prompt
        │   <code>...code...</code>
        │   <update>...instructions...</update>
        │
        ▼
┌────────────────┐
│  MorphClient   │
│  (morphClient) │
└───────┬────────┘
        │ POST /chat/completions
        │ Authorization: Bearer {key}
        ▼
┌────────────────┐
│  OpenRouter    │
│  API           │
└───────┬────────┘
        │ Completion response
        ▼
┌────────────────┐
│  Handler       │
│  Extract code  │
└───────┬────────┘
        │ EditFileResponse
        ▼
┌────────────────┐
│  HTTP Server   │
│  Send JSON     │
└───────┬────────┘
        │ { updatedCode, model, usage }
        ▼
┌────────────────┐
│  Client        │
│  Response      │
└────────────────┘
```

---

## Configuration Architecture

### Configuration Sources

```
Priority (highest to lowest):
1. CLI Flags (--port, --api-key, --model, --base-url)
2. Environment Variables (PORT, MORPH_API_KEY, MORPH_MODEL, MORPH_BASE_URL)
3. Default Values (3333, https://openrouter.ai/api/v1, morph/morph-v2)
```

### Configuration Resolution Flow

```
┌─────────────┐
│  CLI Entry  │
│  (cli.ts)   │
└──────┬──────┘
       │ Parse CLI flags
       ▼
┌─────────────┐
│  Config     │
│  Resolver   │
│  (config.ts)│
└──────┬──────┘
       │
       ├─> Check CLI flags first
       ├─> Fallback to env vars
       ├─> Apply defaults
       ├─> Validate required fields
       └─> Sanitize values
       │
       ▼
┌─────────────┐
│ ServerConfig│
│   Object    │
└─────────────┘
```

---

## Error Handling Strategy

### Error Categories

1. **Configuration Errors** (thrown at startup)
   - Missing API key → `ConfigError`
   - Invalid port → `ConfigError`
   - Invalid base URL → `ConfigError`
   - **Result:** Process exits with error code 1

2. **Request Validation Errors** (400 responses)
   - Missing required fields
   - Invalid field types
   - Empty field values
   - **Result:** JSON error response, connection closed

3. **File System Errors** (400 responses)
   - File not found (ENOENT)
   - Permission denied (EACCES)
   - **Result:** JSON error with fs error message

4. **API Errors** (400 responses)
   - OpenRouter authentication failures
   - Model not found
   - Rate limit exceeded
   - Empty completions
   - **Result:** JSON error with API error message

5. **Server Errors** (500 responses)
   - Unhandled exceptions
   - Stream processing failures
   - **Result:** Generic "Internal server error" message

### Error Propagation

```
handler.ts throws error
  └─> Caught in server.ts route handler
      └─> Logged via logger.error()
      └─> Converted to JSON error response
      └─> Sent with appropriate status code
```

---

## Streaming Architecture

### SSE Stream Forwarding

The server uses a transparent forwarding approach for streaming:

```
OpenRouter API
  └─> Returns Web ReadableStream
      └─> Converted to Node.js Readable (Readable.fromWeb)
          └─> Piped directly to HTTP response (pipeline)
              └─> Client receives SSE chunks
```

### Stream Lifecycle

```
1. Client request with stream: true
2. handler.ts returns Readable stream
3. server.ts sets SSE headers:
   - Content-Type: text/event-stream
   - Connection: keep-alive
   - Cache-Control: no-cache
   - Transfer-Encoding: chunked
4. pipeline(stream, response) starts
5. Chunks forwarded as received
6. Stream ends → response ends
7. Error → write error event → end response
```

### Stream Error Handling

```typescript
try {
  const stream = await handleEditStream(config, payload);
  await pipeline(stream, res);
} catch (error) {
  res.write(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
  res.end();
}
```

---

## Build System Architecture

### tsdown Configuration

The project uses `tsdown` instead of `tsc` for building. Configuration in `tsdown.config.ts`:

```typescript
{
  entry: ['src/index.ts', 'src/cli.ts'],
  format: 'esm',
  target: 'node18',
  dts: true,
  clean: true
}
```

### Build Outputs

```
dist/
  ├─ index.js         # Library entry point (ESM)
  ├─ index.d.ts       # Type declarations
  ├─ cli.js           # Executable CLI (ESM with shebang)
  └─ *.js             # All other transpiled modules
```

### Entry Points

1. **Library Entry** (`dist/index.js`)
   - Exports `startServer`, config utilities, types
   - Consumable by other Node.js projects
   - Supports both `import` and `require()` (type: module)

2. **CLI Entry** (`dist/cli.js`)
   - Executable via `npx morph-mcp-server`
   - Includes shebang: `#!/usr/bin/env node`
   - Loads environment, parses CLI, starts server

---

## Security Considerations

### Path Traversal Protection

The server resolves file paths relative to `process.cwd()`:

```typescript
const resolved = path.resolve(process.cwd(), targetPath);
```

This prevents path traversal attacks but allows reading any file within or below the working directory. **Note:** The server does not enforce additional sandboxing.

### API Key Handling

- API key never logged or exposed in responses
- Transmitted to OpenRouter via HTTPS
- Stored in memory only (from env or CLI)
- Not persisted to disk by this application

### Input Validation

- All request fields validated for type and presence
- JSON parsing errors caught and returned as 400
- File paths resolved and sanitized
- No code execution of user inputs

### Rate Limiting

No built-in rate limiting. Rate limits enforced by OpenRouter API. Consider adding:
- Request rate limiting middleware
- IP-based throttling
- API key quotas

---

## Performance Considerations

### Memory Efficiency

- Streaming responses avoid buffering entire completion in memory
- Files read directly into memory (consideration for large files)
- No persistent connections or caching

### Latency Optimization

- Direct stream forwarding (no buffering)
- Minimal processing overhead
- Native Node.js modules (no framework overhead)

### Scalability

- Stateless design (horizontal scaling friendly)
- No shared state between requests
- No connection pooling (each request creates new fetch)

**Scaling Recommendations:**
- Deploy behind load balancer for horizontal scaling
- Use process manager (PM2) for automatic restarts
- Consider Redis for rate limiting across instances

---

## Extension Points

### Adding New Endpoints

Add routes in `server.ts:routeRequest()`:

```typescript
if (req.method === 'GET' && url.pathname === '/models') {
  // Return available models
}
```

### Custom Prompt Formats

Modify `handler.ts:buildCompletionRequest()` to support different prompt templates:

```typescript
function buildCompletionRequest(config, fileContent, payload, stream) {
  const template = config.promptTemplate || 'morph-fast-apply';
  const userContent = applyTemplate(template, fileContent, payload);
  // ...
}
```

### Multiple Model Support

Extend `EditFileRequest` to accept optional model override:

```typescript
interface EditFileRequest {
  model?: string;  // Override config.model
  // ...
}
```

### Caching Layer

Add caching in `handler.ts` before calling MorphClient:

```typescript
const cacheKey = hashRequest(fileContent, instructions, editSnippet);
const cached = await cache.get(cacheKey);
if (cached) return cached;
```

---

## Testing Architecture

### Test Structure (Planned)

```
tests/
  ├─ unit/
  │   ├─ config.test.ts       # Configuration resolution
  │   ├─ handler.test.ts      # Request handling logic
  │   └─ morphClient.test.ts  # API client
  └─ integration/
      ├─ server.test.ts       # End-to-end server tests
      └─ streaming.test.ts    # SSE streaming tests
```

### Testing Strategy

- **Unit Tests:** Test individual functions with mocked dependencies
- **Integration Tests:** Test full request flow with mock OpenRouter API
- **Contract Tests:** Validate OpenRouter API request/response format
- **Load Tests:** Test performance under concurrent requests

---

## Deployment Architecture

### Recommended Deployment

```
┌─────────────────┐
│  Load Balancer  │
│  (nginx/HAProxy)│
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
┌───▼────┐ ┌─▼──────┐ ...    ┌─▼──────┐
│Instance│ │Instance│        │Instance│
│  :3333 │ │  :3334 │        │  :333N │
└────────┘ └────────┘        └────────┘
```

### Environment Setup

```bash
# Production .env
MORPH_API_KEY=sk-or-v1-...
MORPH_BASE_URL=https://openrouter.ai/api/v1
MORPH_MODEL=morph/morph-v2
PORT=3333
LOG_LEVEL=info
OPENROUTER_REFERRER=https://your-app.com
OPENROUTER_TITLE=Your App Name
```

### Process Management (PM2)

```json
{
  "apps": [{
    "name": "morph-mcp-server",
    "script": "./dist/cli.js",
    "instances": 4,
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production",
      "PORT": 3333
    }
  }]
}
```

---

## Monitoring & Observability

### Recommended Logging

Current logging provides:
- Server startup confirmation
- Request routing (debug level)
- File read operations (debug level)
- API communication (debug level)
- Error details (error level)

### Metrics to Track

- Request rate (requests/sec)
- Response latency (p50, p95, p99)
- Error rate (by type)
- OpenRouter API latency
- Token usage (from API responses)

### Health Monitoring

Use `GET /health` endpoint for:
- Load balancer health checks
- Kubernetes liveness probes
- Uptime monitoring services

---

## See Also

- [API Documentation](./API.md) - Detailed API reference
- [Configuration Guide](./CONFIGURATION.md) - Configuration options
- [Development Guide](./DEVELOPMENT.md) - Development workflow
