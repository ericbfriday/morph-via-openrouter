# Development Guide

## Getting Started

### Prerequisites

- **Node.js**: >= 18.18 (LTS recommended)
- **npm**: >= 9.x (comes with Node.js)
- **Git**: For version control
- **OpenRouter API Key**: Get one from [openrouter.ai](https://openrouter.ai/)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ericbfriday/morph-via-openrouter.git
   cd morph-via-openrouter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   # Edit .env and add your MORPH_API_KEY
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Verify installation**
   ```bash
   npm start
   # Server should start on http://localhost:3333
   ```

---

## Project Structure

```
morph-via-openrouter/
├── src/                    # Source code
│   ├── cli.ts             # CLI entry point
│   ├── server.ts          # HTTP server
│   ├── handler.ts         # Request handler logic
│   ├── morphClient.ts     # OpenRouter API client
│   ├── config.ts          # Configuration resolver
│   ├── types.ts           # TypeScript interfaces
│   ├── logger.ts          # Logging utility
│   ├── env.ts             # Environment loader
│   └── index.ts           # Library entry point
├── tests/                 # Test files
│   └── edit-handler.test.ts
├── dist/                  # Compiled output (generated)
│   ├── cli.js            # Executable CLI
│   ├── index.js          # Library export
│   └── *.d.ts            # Type declarations
├── docs/                  # Documentation
│   ├── API.md            # API reference
│   ├── ARCHITECTURE.md   # System design
│   ├── CONFIGURATION.md  # Configuration guide
│   └── DEVELOPMENT.md    # This file
├── package.json           # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tsdown.config.ts      # Build configuration
├── .env.example          # Example environment file
├── CLAUDE.md             # AI assistant context
├── README.md             # Quick start guide
└── .gitignore            # Git ignore rules
```

---

## Development Workflow

### Daily Development

1. **Start development server**
   ```bash
   # Build once
   npm run build

   # Start server (rebuilds not automatic)
   npm start
   ```

2. **Watch mode (if needed)**
   ```bash
   # Install nodemon globally
   npm install -g nodemon

   # Run with auto-restart
   nodemon --watch src --exec "npm run build && npm start"
   ```

3. **Make changes**
   - Edit files in `src/`
   - Run `npm run build` after changes
   - Restart server to test

4. **Test changes**
   ```bash
   # Run tests
   npm test

   # Test specific file
   npx vitest run tests/edit-handler.test.ts
   ```

---

## npm Scripts

### Core Scripts

#### `npm run build`
Compiles TypeScript to JavaScript using tsdown.

**Output:**
- `dist/cli.js` - Executable CLI with shebang
- `dist/index.js` - Library entry point
- `dist/*.d.ts` - Type declarations
- All other compiled modules

**Example:**
```bash
npm run build
```

---

#### `npm run clean`
Removes build artifacts.

**What it does:**
- Deletes `dist/` directory
- Useful before fresh builds

**Example:**
```bash
npm run clean
npm run build
```

---

#### `npm start`
Starts the server using built files in `dist/`.

**Requirements:**
- Must run `npm run build` first
- Requires `MORPH_API_KEY` in environment or .env

**Example:**
```bash
npm run build
MORPH_API_KEY=sk-or-v1-key npm start
```

---

#### `npm test`
Runs test suite using Vitest.

**Features:**
- Watch mode by default (in TTY)
- Coverage reporting (if configured)
- Fast execution

**Example:**
```bash
# Run all tests
npm test

# Run in CI mode (no watch)
npm test -- --run

# Run with coverage
npm test -- --coverage
```

---

### Useful Commands

#### Build and Run
```bash
npm run build && npm start
```

#### Clean Build
```bash
npm run clean && npm run build
```

#### Test Specific File
```bash
npx vitest run tests/edit-handler.test.ts
```

#### Type Check (without building)
```bash
npx tsc --noEmit
```

#### Lint Code
```bash
# Install ESLint first
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npx eslint src/
```

---

## TypeScript Configuration

### tsconfig.json

Key settings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",           // Modern JavaScript
    "module": "ESNext",           // ESM modules
    "moduleResolution": "node",   // Node.js resolution
    "esModuleInterop": true,      // CommonJS interop
    "strict": true,               // Strict type checking
    "skipLibCheck": true,         // Skip lib checking
    "forceConsistentCasingInFileSystem": true
  },
  "include": ["src/**/*"],        // Include all src files
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Type Safety Best Practices

1. **Always define interfaces for complex objects**
   ```typescript
   interface MyRequest {
     field: string;
   }
   ```

2. **Use type guards for runtime validation**
   ```typescript
   function isEditRequest(obj: unknown): obj is EditFileRequest {
     return typeof obj === 'object' && obj !== null && 'target_file' in obj;
   }
   ```

3. **Avoid `any` - use `unknown` instead**
   ```typescript
   // Bad
   function process(data: any) { }

   // Good
   function process(data: unknown) {
     if (typeof data === 'string') {
       // TypeScript knows data is string here
     }
   }
   ```

4. **Use const assertions for literal types**
   ```typescript
   const roles = ['system', 'user', 'assistant'] as const;
   type Role = typeof roles[number]; // 'system' | 'user' | 'assistant'
   ```

---

## Build System (tsdown)

### Why tsdown?

The project uses [tsdown](https://www.npmjs.com/package/tsdown) instead of `tsc`:

**Advantages:**
- Faster builds with esbuild under the hood
- Automatic shebang injection for CLI builds
- Single config for multiple entry points
- Better tree-shaking and bundling

### tsdown.config.ts

```typescript
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],  // Multiple entries
  format: 'esm',                           // Output ESM only
  target: 'node18',                        // Node.js 18+ target
  dts: true,                               // Generate .d.ts files
  clean: true,                             // Clean dist/ before build
  banner: {
    js: '#!/usr/bin/env node'              // Shebang for cli.js
  }
});
```

### Build Process

```
src/index.ts  ──┐
                ├──> tsdown ──> dist/index.js + index.d.ts
src/cli.ts    ──┘               dist/cli.js (with shebang)
```

### Build Troubleshooting

#### Build Fails with Type Errors

```bash
# Check types without building
npx tsc --noEmit

# Fix errors and rebuild
npm run build
```

#### Dist Files Missing

```bash
# Clean and rebuild
npm run clean
npm run build

# Check if dist/ was created
ls dist/
```

#### Module Resolution Errors

Ensure all imports use `.js` extension for local modules:

```typescript
// Correct (ESM requires extensions)
import { logger } from './logger.js';

// Incorrect
import { logger } from './logger';
```

---

## Testing

### Test Setup

The project uses Vitest for testing:

```bash
npm install -D vitest
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run specific file
npx vitest run tests/edit-handler.test.ts

# Run with coverage
npm test -- --coverage
```

### Writing Tests

Create test files in `tests/` directory with `.test.ts` extension:

```typescript
// tests/example.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '../src/myModule.js';

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should throw on invalid input', () => {
    expect(() => myFunction('')).toThrow('Invalid input');
  });
});
```

### Test Structure

```typescript
describe('Module/Function Name', () => {
  describe('specific behavior', () => {
    it('should do something specific', () => {
      // Arrange - setup test data
      const input = 'test';

      // Act - call function
      const result = myFunction(input);

      // Assert - verify result
      expect(result).toBe('expected');
    });
  });
});
```

### Mocking

#### Mock File System

```typescript
import { vi } from 'vitest';
import fs from 'node:fs/promises';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn()
}));

// In test
vi.mocked(fs.readFile).mockResolvedValue('file contents');
```

#### Mock HTTP Requests

```typescript
import { vi } from 'vitest';

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ result: 'success' })
});
```

### Test Coverage

```bash
# Run with coverage report
npm test -- --coverage

# View HTML report
npm test -- --coverage --reporter=html
open coverage/index.html
```

### Current Test Status

As of now, minimal tests exist. Recommended test files to create:

1. `tests/config.test.ts` - Configuration resolution
2. `tests/handler.test.ts` - Request handling
3. `tests/morphClient.test.ts` - API client
4. `tests/server.test.ts` - Integration tests

---

## Debugging

### Debug Configuration (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/dist/cli.js",
      "envFile": "${workspaceFolder}/.env",
      "preLaunchTask": "npm: build",
      "skipFiles": ["<node_internals>/**"],
      "outputCapture": "std"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Debug Logging

Enable debug logs to see detailed execution:

```bash
LOG_LEVEL=debug npm start
```

**Output includes:**
- File read operations
- API request details
- Response streaming status

### Node.js Debugging

```bash
# Start with inspector
node --inspect dist/cli.js

# Or with breakpoint on first line
node --inspect-brk dist/cli.js

# Connect with Chrome DevTools
# Open chrome://inspect in Chrome
```

### Request Debugging

Test requests with verbose output:

```bash
curl -v -X POST http://localhost:3333/edit_file \
  -H "Content-Type: application/json" \
  -d '{
    "target_file": "test.txt",
    "instructions": "Add hello world",
    "editSnippet": "// existing code"
  }'
```

---

## Code Style Guidelines

### Naming Conventions

- **Files**: kebab-case (`morph-client.ts`)
- **Classes**: PascalCase (`MorphClient`)
- **Functions**: camelCase (`handleEditRequest`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_PORT`)
- **Interfaces**: PascalCase (`EditFileRequest`)
- **Type aliases**: PascalCase (`ServerConfig`)

### Code Organization

1. **Imports order**:
   ```typescript
   // 1. Node built-ins
   import fs from 'node:fs/promises';

   // 2. External packages
   import { Command } from 'commander';

   // 3. Local modules
   import { logger } from './logger.js';
   import type { ServerConfig } from './types.js';
   ```

2. **Function order**:
   - Public exports first
   - Private helpers after
   - Alphabetical within each group

3. **Error handling**:
   ```typescript
   // Always provide context in errors
   throw new Error(`Failed to read file: ${filePath}`);

   // Use custom error classes for domain errors
   class ConfigError extends Error {
     constructor(message: string) {
       super(message);
       this.name = 'ConfigError';
     }
   }
   ```

### Documentation

Add JSDoc comments for public APIs:

```typescript
/**
 * Handles code edit requests by reading the target file,
 * constructing a prompt, and calling the Morph API.
 *
 * @param config - Server configuration
 * @param payload - Edit request payload
 * @returns Promise resolving to updated code and metadata
 * @throws {Error} If file cannot be read or API call fails
 */
export async function handleEditRequest(
  config: ServerConfig,
  payload: EditFileRequest,
): Promise<EditFileResponse> {
  // ...
}
```

---

## Common Development Tasks

### Adding a New Endpoint

1. **Add route in server.ts**
   ```typescript
   if (req.method === 'GET' && url.pathname === '/models') {
     const models = await listAvailableModels(config);
     sendJson(res, 200, models);
     return;
   }
   ```

2. **Add handler in handler.ts** (if complex)
   ```typescript
   export async function handleModelsRequest(config: ServerConfig) {
     // Implementation
   }
   ```

3. **Add types in types.ts**
   ```typescript
   export interface ModelsResponse {
     models: string[];
   }
   ```

4. **Update documentation in docs/API.md**

5. **Add tests in tests/**

### Adding Configuration Option

1. **Add to types.ts**
   ```typescript
   export interface ServerConfig {
     newOption: string;
   }
   ```

2. **Add to config.ts**
   ```typescript
   const DEFAULT_NEW_OPTION = 'default-value';

   export function resolveConfig(input: PartialConfig): ServerConfig {
     const newOption = input.newOption ?? env.NEW_OPTION ?? DEFAULT_NEW_OPTION;
     return { ...existing, newOption };
   }
   ```

3. **Add CLI flag in cli.ts**
   ```typescript
   .option('--new-option <value>', 'Description of new option')
   ```

4. **Update docs/CONFIGURATION.md**

5. **Add to .env.example**

### Modifying Prompt Format

The prompt format is in `src/handler.ts:buildCompletionRequest()`:

```typescript
function buildCompletionRequest(
  config: ServerConfig,
  fileContent: string,
  payload: EditFileRequest,
  stream: boolean,
): MorphChatCompletionRequest {
  const userContent = `<code>\n${fileContent}\n</code>\n<update>\n${payload.instructions}\n\n${payload.editSnippet}\n</update>`;
  // ...
}
```

**Important:** Changes to prompt format may affect model behavior. Test thoroughly.

---

## Performance Optimization

### Profiling

```bash
# Profile with Node.js built-in profiler
node --prof dist/cli.js
node --prof-process isolate-*.log > profile.txt
```

### Memory Profiling

```bash
# Track memory usage
node --trace-gc dist/cli.js
```

### Load Testing

Use `autocannon` for load testing:

```bash
npm install -g autocannon

# Test /health endpoint
autocannon -c 100 -d 30 http://localhost:3333/health

# Test /edit_file endpoint
autocannon -c 10 -d 30 -m POST \
  -H "Content-Type: application/json" \
  -b '{"target_file":"test.txt","instructions":"test","editSnippet":"test"}' \
  http://localhost:3333/edit_file
```

---

## Release Process

### Version Bump

```bash
# Update version in package.json
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.1 -> 0.2.0
npm version major  # 0.2.0 -> 1.0.0
```

### Build for Release

```bash
# Clean build
npm run clean
npm run build

# Run tests
npm test -- --run

# Verify dist/ contents
ls -la dist/
```

### Publish to npm

```bash
# Login to npm (first time only)
npm login

# Publish package
npm publish --access public

# Or dry run first
npm publish --dry-run
```

### Git Tagging

```bash
# Create annotated tag
git tag -a v0.1.0 -m "Release version 0.1.0"

# Push tag
git push origin v0.1.0
```

---

## Troubleshooting

### Build Issues

#### "Cannot find module"
- Ensure imports use `.js` extension
- Check `tsconfig.json` module resolution
- Rebuild: `npm run clean && npm run build`

#### Type Errors
- Run `npx tsc --noEmit` to see all type errors
- Check for missing type definitions
- Update `@types/*` packages

### Runtime Issues

#### Server Won't Start
- Check `MORPH_API_KEY` is set
- Verify port is available: `lsof -i :3333`
- Check logs: `LOG_LEVEL=debug npm start`

#### File Not Found Errors
- Verify file path is relative to `process.cwd()`
- Check file permissions: `ls -l <file>`
- Try absolute path in request

#### API Errors
- Verify API key is valid
- Check OpenRouter status page
- Test with cURL directly to OpenRouter API
- Review request format in logs

---

## Contributing

### Pull Request Process

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Make changes with tests**
4. **Run tests and build**
   ```bash
   npm test -- --run
   npm run build
   ```

5. **Commit with descriptive message**
   ```bash
   git commit -m "feat: add support for custom prompt templates"
   ```

6. **Push to fork**
   ```bash
   git push origin feature/my-new-feature
   ```

7. **Open pull request** on GitHub

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(api): add support for streaming responses
fix(handler): handle empty file contents correctly
docs(readme): update installation instructions
refactor(config): simplify configuration resolution
```

---

## Resources

### Documentation
- [API Reference](./API.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Configuration Guide](./CONFIGURATION.md)

### External Links
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Node.js Documentation](https://nodejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)

### Community
- GitHub Issues: [Report bugs or request features](https://github.com/ericbfriday/morph-via-openrouter/issues)
- GitHub Discussions: [Ask questions and share ideas](https://github.com/ericbfriday/morph-via-openrouter/discussions)

---

## See Also

- [API Documentation](./API.md) - API reference
- [Architecture Documentation](./ARCHITECTURE.md) - System design
- [Configuration Guide](./CONFIGURATION.md) - Configuration options
