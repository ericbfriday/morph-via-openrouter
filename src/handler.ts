import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';

import { MorphClient } from './morphClient.js';
import { logger } from './logger.js';
import {
  EditFileRequest,
  EditFileResponse,
  MorphChatCompletionRequest,
  ServerConfig,
} from './types.js';

export async function handleEditRequest(
  config: ServerConfig,
  payload: EditFileRequest,
): Promise<EditFileResponse> {
  validatePayload(payload);

  const client = new MorphClient(config);
  const fileContent = await readFileSafely(payload.target_file);
  const request = buildCompletionRequest(config, fileContent, payload, false);

  const completion = await client.complete(request);

  const message = completion.choices[0]?.message?.content;
  if (!message) {
    throw new Error('Morph API returned an empty completion');
  }

  const result: EditFileResponse = {
    updatedCode: message.trimEnd(),
    model: completion.model,
    usage: completion.usage,
  };

  return result;
}

export async function handleEditStream(
  config: ServerConfig,
  payload: EditFileRequest,
): Promise<Readable> {
  validatePayload(payload);

  const client = new MorphClient(config);
  const fileContent = await readFileSafely(payload.target_file);
  const request = buildCompletionRequest(config, fileContent, payload, true);

  return client.stream(request);
}

function validatePayload(payload: EditFileRequest): void {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload. Expected object.');
  }

  const required: Array<keyof EditFileRequest> = ['target_file', 'instructions', 'editSnippet'];
  for (const key of required) {
    const value = payload[key];
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Invalid or missing field: ${key}`);
    }
  }
}

async function readFileSafely(targetPath: string): Promise<string> {
  const resolved = path.resolve(process.cwd(), targetPath);
  logger.debug(`Reading target file: ${resolved}`);
  return fs.readFile(resolved, 'utf-8');
}

function buildCompletionRequest(
  config: ServerConfig,
  fileContent: string,
  payload: EditFileRequest,
  stream: boolean,
): MorphChatCompletionRequest {
  const userContent = `<code>\n${fileContent}\n</code>\n<update>\n${payload.instructions}\n\n${payload.editSnippet}\n</update>`;
  const messages = [
    {
      role: 'system' as const,
      content:
        'You are Morph fast apply. Carefully update the provided code according to the instructions and edit snippet. Return ONLY the full updated file contents with no commentary.',
    },
    {
      role: 'user' as const,
      content: userContent,
    },
  ];

  return {
    model: config.model,
    messages,
    stream,
  };
}
