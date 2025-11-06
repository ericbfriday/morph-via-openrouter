# Configuration Guide

## Overview

The Morph MCP OpenRouter Server can be configured through multiple sources with a clear priority hierarchy. This guide covers all configuration options, their defaults, validation rules, and usage examples.

---

## Configuration Sources

### Priority Order (Highest to Lowest)

1. **CLI Flags** - Command-line arguments passed when starting the server
2. **Environment Variables** - Variables set in shell or .env file
3. **Default Values** - Built-in fallback values

Example of priority in action:
```bash
# PORT env var is 4000, but CLI flag overrides it
PORT=4000 npx morph-mcp-server --port 3333
# Server listens on port 3333 (CLI flag wins)
```

---

## Configuration Options

### Required Configuration

#### MORPH_API_KEY (Required)

**Description:** OpenRouter API key for authentication

**Environment Variable:** `MORPH_API_KEY`

**CLI Flag:** `--api-key <key>`

**Type:** String (non-empty)

**Default:** None (must be provided)

**Example:**
```bash
# Via environment variable
export MORPH_API_KEY=sk-or-v1-1234567890abcdef
npx morph-mcp-server

# Via CLI flag
npx morph-mcp-server --api-key sk-or-v1-1234567890abcdef

# Via .env file
echo "MORPH_API_KEY=sk-or-v1-1234567890abcdef" > .env
npx morph-mcp-server
```

**Validation:**
- Must be a non-empty string
- No format validation performed (OpenRouter validates)

**Error Message:**
```
Missing Morph API key. Provide MORPH_API_KEY environment variable or --api-key flag.
```

**Obtaining an API Key:**
1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to API Keys section
4. Generate a new key with appropriate permissions
5. Copy the key (starts with `sk-or-v1-`)

---

### Optional Configuration

#### PORT

**Description:** Port number for the HTTP server to listen on

**Environment Variable:** `PORT`

**CLI Flag:** `--port <number>` or `-p <number>`

**Type:** Integer (positive)

**Default:** `3333`

**Example:**
```bash
# Via environment variable
PORT=8080 npx morph-mcp-server

# Via CLI flag
npx morph-mcp-server --port 8080
npx morph-mcp-server -p 8080
```

**Validation:**
- Must be a positive integer
- Must be between 1 and 65535
- Must not be in use by another process

**Error Message:**
```
Invalid port: NaN
```

**Port Selection Guidelines:**
- `3333` - Default, unlikely to conflict
- `8080` - Common alternative HTTP port
- `3000-3999` - Common Node.js development ports
- `> 1024` - No root privileges required (recommended)

---

#### MORPH_BASE_URL

**Description:** Base URL for the OpenRouter API

**Environment Variable:** `MORPH_BASE_URL`

**CLI Flag:** `--base-url <url>`

**Type:** String (valid URL)

**Default:** `https://openrouter.ai/api/v1`

**Example:**
```bash
# Via environment variable
MORPH_BASE_URL=https://openrouter.ai/api/v1 npx morph-mcp-server

# Via CLI flag
npx morph-mcp-server --base-url https://openrouter.ai/api/v1
```

**Validation:**
- Must be a valid URL (protocol + host)
- Trailing slashes automatically removed
- Must use HTTPS in production

**Error Message:**
```
Invalid MORPH_BASE_URL: not-a-valid-url
```

**Use Cases:**
- **Default:** Use OpenRouter's production API
- **Custom:** Use OpenRouter's beta/staging environment (if available)
- **Proxy:** Route through a corporate proxy or API gateway
- **Testing:** Use a mock server for local development

**Important:** Do not change unless you have a specific reason. The default value points to OpenRouter's stable API.

---

#### MORPH_MODEL

**Description:** Model identifier for Morph code editing model

**Environment Variable:** `MORPH_MODEL`

**CLI Flag:** `--model <name>`

**Type:** String (non-empty)

**Default:** `morph/morph-v2`

**Example:**
```bash
# Via environment variable
MORPH_MODEL=morph/morph-v3-large npx morph-mcp-server

# Via CLI flag
npx morph-mcp-server --model morph/morph-v3-large
```

**Available Models:**

| Model ID | Description | Best For |
|----------|-------------|----------|
| `morph/morph-v2` | Morph v2 (default) | General code editing, balanced speed/quality |
| `morph/morph-v3-large` | Morph v3 Large | Complex refactoring, larger context |
| `morph/morph-v3` | Morph v3 Standard | Faster responses, smaller edits |

**Note:** Model availability and names may change. Refer to [OpenRouter's model list](https://openrouter.ai/models) for current options.

**Validation:**
- No format validation performed
- OpenRouter API returns error if model doesn't exist or lacks access

**Error from OpenRouter:**
```json
{
  "error": {
    "code": 404,
    "message": "Model not found: morph/invalid-model"
  }
}
```

---

#### LOG_LEVEL

**Description:** Logging verbosity level

**Environment Variable:** `LOG_LEVEL`

**CLI Flag:** None (environment variable only)

**Type:** String (enum)

**Default:** `info`

**Allowed Values:**
- `debug` - Verbose logging (all messages)
- `info` - Informational messages (default)
- `warn` - Warnings and errors only
- `error` - Errors only

**Example:**
```bash
# Enable debug logging
LOG_LEVEL=debug npx morph-mcp-server

# Only log errors
LOG_LEVEL=error npx morph-mcp-server
```

**Output Examples:**

**debug level:**
```
[info] Morph MCP server listening on http://localhost:3333
[debug] Reading target file: /home/user/project/src/example.ts
[debug] Sending request to Morph API
[debug] Streaming response from Morph API
```

**info level (default):**
```
[info] Morph MCP server listening on http://localhost:3333
```

**error level:**
```
[error] Edit request failed: ENOENT: no such file or directory
```

---

#### OPENROUTER_REFERRER (Analytics)

**Description:** HTTP Referer header for OpenRouter analytics

**Environment Variable:** `OPENROUTER_REFERRER`

**CLI Flag:** None (environment variable only)

**Type:** String (URL or domain)

**Default:** None (header not sent)

**Example:**
```bash
OPENROUTER_REFERRER=https://myapp.com npx morph-mcp-server
```

**Purpose:**
- Helps OpenRouter track which applications use their API
- May provide analytics dashboard in OpenRouter account
- Completely optional, no impact on functionality

**Header Sent:**
```
HTTP-Referer: https://myapp.com
```

---

#### OPENROUTER_TITLE (Analytics)

**Description:** Application title for OpenRouter analytics

**Environment Variable:** `OPENROUTER_TITLE`

**CLI Flag:** None (environment variable only)

**Type:** String

**Default:** None (header not sent)

**Example:**
```bash
OPENROUTER_TITLE="My Code Editor" npx morph-mcp-server
```

**Purpose:**
- Provides a human-readable name for your application
- Used in OpenRouter's analytics and billing dashboards
- Completely optional, no impact on functionality

**Header Sent:**
```
X-Title: My Code Editor
```

---

#### MORPH_ENV_PATH

**Description:** Path to alternative .env file

**Environment Variable:** `MORPH_ENV_PATH`

**CLI Flag:** None (must be set before process starts)

**Type:** String (file path)

**Default:** `.env` in current working directory

**Example:**
```bash
MORPH_ENV_PATH=/etc/morph/.env.production npx morph-mcp-server
```

**Use Cases:**
- Multiple environments (dev, staging, prod)
- Shared configuration directories
- Centralized secret management

**Note:** This variable must be set in the shell environment, not in the .env file itself.

---

## Configuration File (.env)

### Creating a .env File

Create a `.env` file in your project root:

```bash
# Required
MORPH_API_KEY=sk-or-v1-your-api-key-here

# Optional
PORT=3333
MORPH_BASE_URL=https://openrouter.ai/api/v1
MORPH_MODEL=morph/morph-v2
LOG_LEVEL=info

# Analytics (Optional)
OPENROUTER_REFERRER=https://yourapp.com
OPENROUTER_TITLE=Your App Name
```

### .env File Best Practices

1. **Never commit .env to version control**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Create .env.example for documentation**
   ```bash
   # .env.example
   MORPH_API_KEY=sk-or-v1-your-key-here
   PORT=3333
   MORPH_MODEL=morph/morph-v2
   ```

3. **Use different files for different environments**
   ```bash
   .env.development
   .env.staging
   .env.production
   ```

4. **Protect .env file permissions**
   ```bash
   chmod 600 .env
   ```

### Loading .env Files

The server automatically loads `.env` from the current working directory. To use a different file:

```bash
# Set MORPH_ENV_PATH before running
MORPH_ENV_PATH=.env.production npx morph-mcp-server
```

---

## Configuration Examples

### Development Setup

```bash
# .env.development
MORPH_API_KEY=sk-or-v1-dev-key
PORT=3333
MORPH_MODEL=morph/morph-v2
LOG_LEVEL=debug
OPENROUTER_TITLE=Morph Dev Server
```

```bash
MORPH_ENV_PATH=.env.development npm start
```

---

### Production Setup

```bash
# .env.production
MORPH_API_KEY=sk-or-v1-prod-key
PORT=3333
MORPH_MODEL=morph/morph-v2
LOG_LEVEL=warn
OPENROUTER_REFERRER=https://production.myapp.com
OPENROUTER_TITLE=MyApp Production
```

```bash
MORPH_ENV_PATH=.env.production npm start
```

---

### Docker Setup

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
CMD ["node", "dist/cli.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  morph-server:
    build: .
    ports:
      - "3333:3333"
    environment:
      - MORPH_API_KEY=${MORPH_API_KEY}
      - PORT=3333
      - MORPH_MODEL=morph/morph-v2
      - LOG_LEVEL=info
    restart: unless-stopped
```

**Run with:**
```bash
MORPH_API_KEY=sk-or-v1-key docker-compose up
```

---

### Kubernetes Setup

**ConfigMap:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: morph-config
data:
  PORT: "3333"
  MORPH_MODEL: "morph/morph-v2"
  MORPH_BASE_URL: "https://openrouter.ai/api/v1"
  LOG_LEVEL: "info"
```

**Secret:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: morph-secret
type: Opaque
stringData:
  MORPH_API_KEY: sk-or-v1-your-key-here
```

**Deployment:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: morph-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: morph-server
  template:
    metadata:
      labels:
        app: morph-server
    spec:
      containers:
      - name: morph-server
        image: your-registry/morph-mcp-server:latest
        ports:
        - containerPort: 3333
        envFrom:
        - configMapRef:
            name: morph-config
        - secretRef:
            name: morph-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3333
          initialDelaySeconds: 10
          periodSeconds: 30
```

---

### Systemd Service Setup

**Create service file** `/etc/systemd/system/morph-mcp-server.service`:

```ini
[Unit]
Description=Morph MCP OpenRouter Server
After=network.target

[Service]
Type=simple
User=morph
WorkingDirectory=/opt/morph-mcp-server
Environment="NODE_ENV=production"
EnvironmentFile=/opt/morph-mcp-server/.env
ExecStart=/usr/bin/node /opt/morph-mcp-server/dist/cli.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable morph-mcp-server
sudo systemctl start morph-mcp-server
sudo systemctl status morph-mcp-server
```

---

## Configuration Validation

### Server Startup Validation

The server validates configuration at startup and exits with error code 1 if validation fails:

```bash
$ MORPH_API_KEY= npx morph-mcp-server
[error] Failed to start Morph MCP server
ConfigError: Missing Morph API key. Provide MORPH_API_KEY environment variable or --api-key flag.
$ echo $?
1
```

### Common Validation Errors

#### Missing API Key
```
ConfigError: Missing Morph API key. Provide MORPH_API_KEY environment variable or --api-key flag.
```

**Fix:**
```bash
export MORPH_API_KEY=sk-or-v1-your-key
```

---

#### Invalid Port
```
ConfigError: Invalid port: abc
```

**Fix:**
```bash
export PORT=3333
```

---

#### Invalid Base URL
```
ConfigError: Invalid MORPH_BASE_URL: not-a-url
```

**Fix:**
```bash
export MORPH_BASE_URL=https://openrouter.ai/api/v1
```

---

## Runtime Configuration

### Configuration Inspection

To verify the active configuration, check server startup logs:

```bash
LOG_LEVEL=debug npx morph-mcp-server
```

Output:
```
[info] Morph MCP server listening on http://localhost:3333
```

For detailed configuration, add debug logging in `src/cli.ts`:

```typescript
logger.debug('Configuration:', config);
```

---

### Changing Configuration at Runtime

The server does not support runtime configuration changes. To apply new configuration:

1. Update .env file or environment variables
2. Restart the server

**Using PM2:**
```bash
pm2 restart morph-mcp-server
```

**Using systemd:**
```bash
sudo systemctl restart morph-mcp-server
```

**Using Docker:**
```bash
docker-compose restart
```

---

## Security Best Practices

### 1. Protect API Keys

```bash
# Set restrictive permissions
chmod 600 .env

# Never commit to version control
echo ".env" >> .gitignore

# Use secrets management in production
# - AWS Secrets Manager
# - HashiCorp Vault
# - Kubernetes Secrets
```

### 2. Use Environment Variables in CI/CD

**GitHub Actions:**
```yaml
env:
  MORPH_API_KEY: ${{ secrets.MORPH_API_KEY }}
```

**GitLab CI:**
```yaml
variables:
  MORPH_API_KEY: ${MORPH_API_KEY}
```

### 3. Rotate API Keys Regularly

1. Generate new key in OpenRouter dashboard
2. Update configuration
3. Restart server
4. Revoke old key

### 4. Use HTTPS in Production

Never use `http://` for `MORPH_BASE_URL` in production. Always use `https://`.

---

## Troubleshooting

### Configuration Not Loading

**Problem:** Changes to .env file not taking effect

**Solutions:**
1. Verify .env is in current working directory
2. Check for typos in variable names
3. Restart the server
4. Use `LOG_LEVEL=debug` to see loaded values

---

### Port Already in Use

**Problem:** Server fails to start with `EADDRINUSE`

**Solutions:**
1. Change PORT to an unused port
2. Kill process using the port:
   ```bash
   lsof -ti:3333 | xargs kill -9
   ```
3. Use dynamic port assignment:
   ```bash
   PORT=0 npx morph-mcp-server
   ```

---

### Invalid API Key

**Problem:** OpenRouter returns 401 Unauthorized

**Solutions:**
1. Verify API key is correct (copy-paste from OpenRouter)
2. Check for extra whitespace or newlines
3. Ensure key has not expired or been revoked
4. Generate new key in OpenRouter dashboard

---

### Model Not Found

**Problem:** OpenRouter returns 404 for model

**Solutions:**
1. Check model name spelling (case-sensitive)
2. Verify model exists on OpenRouter
3. Ensure account has access to the model
4. Use default model: `morph/morph-v2`

---

## See Also

- [API Documentation](./API.md) - API endpoints and usage
- [Architecture Documentation](./ARCHITECTURE.md) - System design
- [Development Guide](./DEVELOPMENT.md) - Development workflow
