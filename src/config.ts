import { ServerConfig } from './types.js';

export interface PartialConfig {
  port?: number;
  baseUrl?: string;
  model?: string;
  apiKey?: string;
}

const DEFAULT_PORT = 3333;
const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'morph/morph-v2';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export function resolveConfig(input: PartialConfig = {}): ServerConfig {
  const env = process.env;

  const apiKey = input.apiKey ?? env.MORPH_API_KEY;
  if (!apiKey) {
    throw new ConfigError('Missing Morph API key. Provide MORPH_API_KEY environment variable or --api-key flag.');
  }

  const portValue = input.port ?? (env.PORT ? Number(env.PORT) : undefined);
  const port = portValue ?? DEFAULT_PORT;
  if (!Number.isInteger(port) || port <= 0) {
    throw new ConfigError(`Invalid port: ${portValue}`);
  }

  const baseUrl = sanitizeBaseUrl(input.baseUrl ?? env.MORPH_BASE_URL ?? DEFAULT_BASE_URL);
  const model = input.model ?? env.MORPH_MODEL ?? DEFAULT_MODEL;

  return {
    port,
    apiKey,
    baseUrl,
    model,
  };
}

function sanitizeBaseUrl(rawUrl: string): string {
  if (!rawUrl) {
    return DEFAULT_BASE_URL;
  }

  try {
    const url = new URL(rawUrl);
    return url.toString().replace(/\/$/, '');
  } catch (error) {
    throw new ConfigError(`Invalid MORPH_BASE_URL: ${rawUrl}`);
  }
}
