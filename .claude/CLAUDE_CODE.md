# Claude Code Configuration Guide

This document explains the Claude Code configuration for the Morph MCP OpenRouter Server project.

## Overview

This repository enforces the use of the **superclaude plugin** and provides pre-configured MCP servers for seamless integration with Claude Code.

## Configuration Files

### `.claude/settings.json`

This file configures Claude Code settings and enforces the superclaude plugin:

- **Plugin Enforcement**: Requires the superclaude plugin to be enabled for all users
- **Editor Settings**: Configures formatting, tab size, and other editor preferences
- **Git Settings**: Controls auto-staging and commit message requirements
- **Security**: Defines file and network access permissions

### `.claude/mcp.json`

This file configures MCP (Model Context Protocol) servers:

#### Configured Servers

1. **morph-openrouter** (This Project)
   - Runs the local Morph MCP server built from this repository
   - Uses environment variables from your `.env` file
   - Provides fast apply capabilities through OpenRouter
   - AutoStart: Disabled (manual start)

2. **filesystem**
   - Standard MCP filesystem server
   - Provides file operations within the workspace
   - AutoStart: Enabled

3. **git**
   - Standard MCP git server
   - Provides repository operations
   - AutoStart: Enabled

## Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/ericbfriday/morph-via-openrouter.git
cd morph-via-openrouter
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your OpenRouter API key:

```bash
cp .env.example .env
```

Edit `.env` and set your API key:

```env
MORPH_API_KEY=sk-or-v1-your-actual-key-here
```

### 3. Build the Project

```bash
npm run build
```

This creates the `dist/` directory with the compiled server code.

### 4. Open in Claude Code

Open the project in Claude Code. The configuration files will be automatically detected:

- The superclaude plugin will be enforced
- MCP servers will be available in the Claude Code interface
- Environment variables will be loaded from your `.env` file

## Using MCP Servers

### Starting the Morph OpenRouter Server

The morph-openrouter MCP server is configured but not auto-started. To use it:

1. Ensure you've completed the setup instructions above
2. In Claude Code, manually start the "morph-openrouter" MCP server
3. The server will run on port 3333 (or the port specified in your `.env`)

### Making Edit Requests

Once the server is running, you can send POST requests to the `/edit_file` endpoint:

```bash
curl -X POST http://localhost:3333/edit_file \
  -H "Content-Type: application/json" \
  -d '{
    "target_file": "src/example.ts",
    "instructions": "Add error handling",
    "editSnippet": "function fetchData() {...}",
    "stream": false
  }'
```

## Environment Variables Reference

All environment variables are documented in `.env.example`:

### Required
- `MORPH_API_KEY`: Your OpenRouter API key

### Optional
- `MORPH_BASE_URL`: API base URL (default: `https://openrouter.ai/api/v1`)
- `MORPH_MODEL`: Model to use (default: `morph/morph-v3-fast`)
- `PORT`: Server port (default: `3333`)
- `LOG_LEVEL`: Logging level (default: `info`)
- `OPENROUTER_REFERRER`: Analytics referrer
- `OPENROUTER_TITLE`: Analytics title
- `MORPH_ENV_PATH`: Custom path to env file

## Superclaude Plugin Benefits

The enforced superclaude plugin provides:

- Enhanced code editing capabilities
- Improved context understanding
- Better code generation and refactoring
- Consistent editing experience across the team

## Troubleshooting

### MCP Server Won't Start

1. Verify you've run `npm run build`
2. Check that `dist/cli.js` exists
3. Verify your `.env` file has valid configuration
4. Check Claude Code logs for error messages

### Environment Variables Not Loading

1. Ensure `.env` file is in the project root
2. Verify variable names match `.env.example`
3. Restart Claude Code after changing `.env`

### API Key Issues

1. Get your key from: https://openrouter.ai/keys
2. Ensure it starts with `sk-or-v1-`
3. Check that it has sufficient credits/permissions

## Contributing

When contributing to this project:

1. Ensure Claude Code is installed
2. The superclaude plugin will be automatically enforced
3. MCP servers will be available per the configuration
4. Follow the existing code style and formatting rules

## Support

For issues with:
- **Claude Code**: Visit https://docs.claude.com
- **This Project**: Open an issue at https://github.com/ericbfriday/morph-via-openrouter/issues
- **OpenRouter**: Visit https://openrouter.ai/docs
