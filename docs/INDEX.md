# Documentation Index

## Overview

Complete documentation for the Morph MCP OpenRouter Server - a lightweight HTTP proxy that bridges MCP clients with Morph code editing models hosted on OpenRouter.

---

## Quick Navigation

### For New Users
1. [README.md](../README.md) - Quick start guide
2. [CONFIGURATION.md](./CONFIGURATION.md) - Set up your environment
3. [API.md](./API.md) - Make your first request

### For Developers
1. [DEVELOPMENT.md](./DEVELOPMENT.md) - Development setup
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
3. [API.md](./API.md) - API reference

### For DevOps
1. [CONFIGURATION.md](./CONFIGURATION.md) - Deployment configuration
2. [ARCHITECTURE.md](./ARCHITECTURE.md#deployment-architecture) - Deployment patterns
3. [API.md](./API.md#error-handling) - Error handling

---

## Documentation Structure

### 1. README.md
**Location:** [`../README.md`](../README.md)

**Purpose:** Quick start guide and project introduction

**Contents:**
- Project overview and purpose
- Quick installation steps
- Basic usage examples
- Configuration essentials
- Health check endpoint

**Audience:** New users, evaluators

**Estimated Reading Time:** 3 minutes

---

### 2. API.md
**Location:** [`./API.md`](./API.md)

**Purpose:** Complete API reference with examples

**Contents:**
- Base URL and authentication
- POST /edit_file endpoint (detailed)
  - Request/response formats
  - Streaming vs non-streaming
  - Error responses
- GET /health endpoint
- Internal prompt format
- OpenRouter integration details
- Rate limits and quotas
- Comprehensive examples (cURL, Node.js)

**Audience:** API consumers, integration developers

**Estimated Reading Time:** 15 minutes

**Key Sections:**
- [POST /edit_file](./API.md#post-editfile) - Main editing endpoint
- [Streaming Response](./API.md#response-streaming) - SSE streaming format
- [Error Handling](./API.md#error-response) - Error codes and messages
- [Examples](./API.md#examples) - Working code examples

---

### 3. ARCHITECTURE.md
**Location:** [`./ARCHITECTURE.md`](./ARCHITECTURE.md)

**Purpose:** System design and implementation details

**Contents:**
- System overview with diagrams
- Design principles
- Module architecture (all 8 modules documented)
- Request flow diagrams (streaming and non-streaming)
- Data flow visualization
- Configuration architecture
- Error handling strategy
- Streaming architecture (SSE forwarding)
- Build system (tsdown)
- Security considerations
- Performance considerations
- Extension points
- Testing architecture (planned)
- Deployment architecture
- Monitoring and observability

**Audience:** Contributors, architects, maintainers

**Estimated Reading Time:** 30 minutes

**Key Sections:**
- [Module Architecture](./ARCHITECTURE.md#module-architecture) - Code organization
- [Request Flow](./ARCHITECTURE.md#request-flow-non-streaming) - How requests work
- [Security Considerations](./ARCHITECTURE.md#security-considerations) - Security features
- [Deployment Architecture](./ARCHITECTURE.md#deployment-architecture) - Production setup

---

### 4. CONFIGURATION.md
**Location:** [`./CONFIGURATION.md`](./CONFIGURATION.md)

**Purpose:** Complete configuration reference

**Contents:**
- Configuration sources and priority
- Required configuration (MORPH_API_KEY)
- Optional configuration (all options)
- .env file best practices
- Configuration examples
  - Development setup
  - Production setup
  - Docker setup
  - Kubernetes setup
  - Systemd service
- Configuration validation
- Runtime configuration
- Security best practices
- Troubleshooting

**Audience:** Operators, DevOps, developers

**Estimated Reading Time:** 20 minutes

**Key Sections:**
- [Required Configuration](./CONFIGURATION.md#required-configuration) - Must-have settings
- [Configuration Examples](./CONFIGURATION.md#configuration-examples) - Real-world setups
- [Security Best Practices](./CONFIGURATION.md#security-best-practices) - Secure deployment
- [Troubleshooting](./CONFIGURATION.md#troubleshooting) - Common issues

---

### 5. DEVELOPMENT.md
**Location:** [`./DEVELOPMENT.md`](./DEVELOPMENT.md)

**Purpose:** Developer onboarding and workflow guide

**Contents:**
- Getting started (prerequisites, setup)
- Project structure
- Development workflow
- npm scripts reference
- TypeScript configuration
- Build system (tsdown)
- Testing guide (Vitest)
- Debugging (VS Code, Node.js)
- Code style guidelines
- Common development tasks
  - Adding endpoints
  - Adding configuration
  - Modifying prompts
- Performance optimization
- Release process
- Contributing guidelines

**Audience:** Contributors, maintainers

**Estimated Reading Time:** 25 minutes

**Key Sections:**
- [Getting Started](./DEVELOPMENT.md#getting-started) - Initial setup
- [Development Workflow](./DEVELOPMENT.md#development-workflow) - Daily development
- [Testing](./DEVELOPMENT.md#testing) - How to test
- [Common Development Tasks](./DEVELOPMENT.md#common-development-tasks) - Recipes

---

### 6. CLAUDE.md
**Location:** [`../CLAUDE.md`](../CLAUDE.md)

**Purpose:** AI assistant context and guidance

**Contents:**
- Project overview for AI assistants
- Architecture summary
- Core components
- Request flow
- Prompt format (critical for Morph models)
- Development commands
- Configuration summary
- Build system details
- Testing setup
- API endpoints
- Important implementation details

**Audience:** AI coding assistants (Claude Code, GitHub Copilot, etc.)

**Estimated Reading Time:** 5 minutes (for AI)

---

## Documentation by Use Case

### I want to...

#### Use the Server
1. [README.md](../README.md) - Quick start
2. [CONFIGURATION.md](./CONFIGURATION.md) - Configuration options
3. [API.md](./API.md) - API usage

#### Deploy to Production
1. [CONFIGURATION.md](./CONFIGURATION.md#production-setup) - Production config
2. [CONFIGURATION.md](./CONFIGURATION.md#docker-setup) - Docker deployment
3. [CONFIGURATION.md](./CONFIGURATION.md#kubernetes-setup) - K8s deployment
4. [ARCHITECTURE.md](./ARCHITECTURE.md#deployment-architecture) - Deployment patterns

#### Contribute Code
1. [DEVELOPMENT.md](./DEVELOPMENT.md#getting-started) - Setup
2. [DEVELOPMENT.md](./DEVELOPMENT.md#contributing) - Contribution guidelines
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the codebase

#### Integrate with My Application
1. [API.md](./API.md) - API reference
2. [API.md](./API.md#examples) - Integration examples
3. [CONFIGURATION.md](./CONFIGURATION.md) - Server configuration

#### Troubleshoot Issues
1. [CONFIGURATION.md](./CONFIGURATION.md#troubleshooting) - Config issues
2. [DEVELOPMENT.md](./DEVELOPMENT.md#troubleshooting) - Development issues
3. [API.md](./API.md#error-handling) - API errors
4. [ARCHITECTURE.md](./ARCHITECTURE.md#error-handling-strategy) - Error system

#### Understand the Design
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Full system design
2. [ARCHITECTURE.md](./ARCHITECTURE.md#request-flow-non-streaming) - Request flow
3. [ARCHITECTURE.md](./ARCHITECTURE.md#module-architecture) - Code structure

---

## Documentation Standards

### Completeness Checklist

- [x] Project overview and purpose
- [x] Installation instructions
- [x] Configuration reference (all options)
- [x] API reference (all endpoints)
- [x] Architecture documentation
- [x] Development workflow
- [x] Testing guide
- [x] Deployment examples
- [x] Troubleshooting sections
- [x] Code examples
- [x] Diagrams and visualizations
- [x] Security considerations
- [x] Performance considerations
- [x] Contributing guidelines

### Quality Attributes

1. **Clarity**: Written for the target audience with appropriate technical depth
2. **Completeness**: Covers all major features and use cases
3. **Accuracy**: Reflects current codebase (v0.1.0)
4. **Navigability**: Cross-referenced with clear structure
5. **Examples**: Includes working code examples
6. **Maintenance**: Designed for easy updates

### Documentation Metrics

| Document | Lines | Sections | Examples | Diagrams |
|----------|-------|----------|----------|----------|
| README.md | ~50 | 5 | 3 | 0 |
| API.md | ~600 | 15 | 8 | 1 |
| ARCHITECTURE.md | ~900 | 25 | 10 | 5 |
| CONFIGURATION.md | ~700 | 20 | 12 | 0 |
| DEVELOPMENT.md | ~800 | 22 | 15 | 0 |
| CLAUDE.md | ~100 | 10 | 2 | 0 |
| **Total** | **~3150** | **97** | **50** | **6** |

---

## Cross-Reference Matrix

| From | To | Link Type |
|------|-----|-----------|
| README.md | API.md | Endpoint reference |
| README.md | CONFIGURATION.md | Configuration details |
| API.md | CONFIGURATION.md | Authentication setup |
| API.md | ARCHITECTURE.md | System design |
| ARCHITECTURE.md | API.md | API contract |
| ARCHITECTURE.md | DEVELOPMENT.md | Implementation |
| CONFIGURATION.md | ARCHITECTURE.md | Config architecture |
| CONFIGURATION.md | DEVELOPMENT.md | Development config |
| DEVELOPMENT.md | API.md | API testing |
| DEVELOPMENT.md | ARCHITECTURE.md | System understanding |

---

## Maintenance Guide

### Updating Documentation

When making code changes, update corresponding documentation:

1. **API Changes**
   - Update `API.md` with new endpoints or parameters
   - Update examples if request/response format changes
   - Update `CLAUDE.md` if prompt format changes

2. **Configuration Changes**
   - Update `CONFIGURATION.md` with new options
   - Update `.env.example`
   - Update `CLAUDE.md` configuration section

3. **Architecture Changes**
   - Update `ARCHITECTURE.md` diagrams and flows
   - Update module descriptions if structure changes
   - Update `CLAUDE.md` architecture summary

4. **Development Process Changes**
   - Update `DEVELOPMENT.md` workflow sections
   - Update build/test instructions
   - Update contributing guidelines

### Documentation Review Checklist

Before releasing new version:

- [ ] All code examples tested and working
- [ ] Configuration examples up to date
- [ ] Version numbers updated
- [ ] New features documented
- [ ] Breaking changes highlighted
- [ ] Error messages match codebase
- [ ] Links between docs verified
- [ ] Diagrams reflect current architecture

---

## Version History

### v0.1.0 (Current)
- Initial comprehensive documentation
- Complete API reference
- Full architecture documentation
- Configuration guide with examples
- Development workflow guide
- AI assistant context (CLAUDE.md)

---

## Contributing to Documentation

### Style Guide

1. **Headings**: Use sentence case, not title case
2. **Code blocks**: Always specify language for syntax highlighting
3. **Examples**: Provide complete, runnable examples
4. **Links**: Use relative paths for internal docs
5. **Voice**: Use active voice, second person ("you")

### Documentation Issues

Found an error or gap in documentation?

1. Check if it's already reported: [GitHub Issues](https://github.com/ericbfriday/morph-via-openrouter/issues)
2. Create new issue with label `documentation`
3. Include:
   - Document name and section
   - What's incorrect or missing
   - Suggested fix (if applicable)

### Documentation Pull Requests

1. Follow the contribution process in [DEVELOPMENT.md](./DEVELOPMENT.md#contributing)
2. Update relevant sections
3. Run spell check
4. Test all code examples
5. Update this index if adding new documents

---

## Additional Resources

### External Documentation

- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [Model Context Protocol (MCP) Specification](https://spec.modelcontextprotocol.io/)
- [Node.js HTTP Module Documentation](https://nodejs.org/api/http.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Related Projects

- [Morph Models on OpenRouter](https://openrouter.ai/models?q=morph)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)

### Community

- [GitHub Repository](https://github.com/ericbfriday/morph-via-openrouter)
- [Issue Tracker](https://github.com/ericbfriday/morph-via-openrouter/issues)
- [Discussions](https://github.com/ericbfriday/morph-via-openrouter/discussions)

---

## Quick Reference Cards

### Common Commands

```bash
# Development
npm install           # Install dependencies
npm run build        # Build project
npm start            # Start server
npm test             # Run tests

# Deployment
docker-compose up    # Run in Docker
kubectl apply -f k8s/ # Deploy to K8s
systemctl start morph # Start systemd service

# Debugging
LOG_LEVEL=debug npm start      # Debug logging
node --inspect dist/cli.js     # Node inspector
curl -v http://localhost:3333/health # Test endpoint
```

### Configuration Quick Reference

```bash
# Required
MORPH_API_KEY=sk-or-v1-...

# Optional (with defaults)
PORT=3333
MORPH_BASE_URL=https://openrouter.ai/api/v1
MORPH_MODEL=morph/morph-v2
LOG_LEVEL=info

# Analytics (optional)
OPENROUTER_REFERRER=https://yourapp.com
OPENROUTER_TITLE="Your App"
```

### API Quick Reference

```bash
# Health check
GET /health

# Edit file (non-streaming)
POST /edit_file
{
  "target_file": "path/to/file",
  "instructions": "what to change",
  "editSnippet": "code context",
  "stream": false
}

# Edit file (streaming)
POST /edit_file
{
  "target_file": "path/to/file",
  "instructions": "what to change",
  "editSnippet": "code context",
  "stream": true
}
```

---

## Search Index

### Key Terms

- **API Key**: MORPH_API_KEY, authentication, OpenRouter
- **Configuration**: environment variables, .env, CLI flags
- **Streaming**: SSE, Server-Sent Events, real-time
- **Deployment**: Docker, Kubernetes, systemd, production
- **Development**: npm scripts, build, test, debug
- **Architecture**: modules, request flow, data flow
- **Error Handling**: validation, HTTP status codes, troubleshooting
- **Security**: API key protection, path traversal, HTTPS
- **Performance**: streaming, memory, scalability

---

**Last Updated:** 2025-01-05
**Documentation Version:** 1.0.0
**Project Version:** 0.1.0
