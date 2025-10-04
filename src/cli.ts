#!/usr/bin/env node
import './env.js';
import { Command } from 'commander';

import { resolveConfig } from './config.js';
import { startServer } from './server.js';
import { logger } from './logger.js';

const program = new Command();

program
  .name('morph-mcp-server')
  .description('Local MCP server that proxies Morph fast apply via OpenRouter.')
  .option('-p, --port <number>', 'Port to listen on. Defaults to 3333 or PORT env.')
  .option('--base-url <url>', 'Morph/OpenRouter base URL. Defaults to MORPH_BASE_URL env or https://openrouter.ai/api/v1.')
  .option('--model <name>', 'Morph model identifier.')
  .option('--api-key <key>', 'Morph API key (can use MORPH_API_KEY env).')
  .action(async (options) => {
    try {
      const config = resolveConfig({
        port: options.port ? Number(options.port) : undefined,
        baseUrl: options.baseUrl,
        model: options.model,
        apiKey: options.apiKey,
      });

      await startServer(config);
    } catch (error) {
      logger.error('Failed to start Morph MCP server', error);
      process.exitCode = 1;
    }
  });

program.parseAsync().catch((error) => {
  logger.error('CLI execution failed', error);
  process.exitCode = 1;
});
