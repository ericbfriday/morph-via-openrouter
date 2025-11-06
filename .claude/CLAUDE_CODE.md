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

## Superclaude Plugin

### What is SuperClaude?

**SuperClaude** is a third-party, open-source framework that augments Claude Code with specialized development capabilities. It is **not** an official Anthropic plugin but rather an independent project maintained by the community.

**Important**: This repository enforces SuperClaude as a required plugin. You must install it to work with Claude Code on this project.

### Key Features

SuperClaude transforms Claude Code into a structured expert development platform by providing:

- **19+ specialized commands**: Covering the entire development lifecycle (build, analyze, optimize, review, audit, deploy, test, etc.)
- **9 expert personas**: Domain-specific expertise (architect, security, backend, QA, performance, mentor, etc.)
- **Enhanced code editing**: Improved context understanding and code generation
- **Workflow automation**: Advanced automation, context persistence, and task orchestration
- **Evidence-based development**: Contextual memory and rules-engine to reduce hallucinations

### Installation

You must install SuperClaude before working with this repository. Choose one of the following methods:

#### Option 1: Claude Code Marketplace (Recommended)

```bash
# Add the SuperClaude plugin via marketplace
/plugin marketplace add SuperClaude-Org/SuperClaude_Plugin
/plugin install sc@superclaude-official

# Restart Claude Code to activate
```

#### Option 2: GitHub (Manual Install)

```bash
# Clone the repository
git clone https://github.com/SuperClaude-Org/SuperClaude_Plugin.git
cd SuperClaude_Plugin

# Run the installer (copies config to ~/.claude/)
./install.sh
```

#### Option 3: Package Managers

**Python (pip):**
```bash
pip install SuperClaude
```

**Node.js (npm):**
```bash
npm install -g @bifrost_inc/superclaude
```

**pipx:**
```bash
pipx install SuperClaude
```

**uv:**
```bash
uv tool install SuperClaude
```

**Note**: If upgrading, uninstall older versions first to avoid configuration conflicts.

### Why is SuperClaude Required?

This project enforces SuperClaude to ensure:

- Consistent development experience across all contributors
- Access to advanced code editing and analysis capabilities
- Standardized workflow automation and task orchestration
- Expert-level domain guidance for code reviews and security audits

### Resources

- **GitHub Repository**: https://github.com/SuperClaude-Org/SuperClaude_Plugin
- **Documentation**: https://claudelog.com/claude-code-mcps/super-claude/
- **PyPI Package**: https://pypi.org/project/SuperClaude/
- **License**: MIT (Open Source)

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
