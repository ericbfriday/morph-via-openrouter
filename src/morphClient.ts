import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';

import { MorphChatCompletionRequest, MorphChatCompletionResponse, ServerConfig } from './types.js';
import { logger } from './logger.js';

export class MorphClient {
  constructor(private readonly config: ServerConfig) {}

  async complete(request: MorphChatCompletionRequest): Promise<MorphChatCompletionResponse> {
    const response = await this.performRequest(request);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Morph API error (${response.status}): ${text}`);
    }

    const data = (await response.json()) as MorphChatCompletionResponse;
    return data;
  }

  async stream(request: MorphChatCompletionRequest): Promise<Readable> {
    const response = await this.performRequest({ ...request, stream: true });

    if (!response.ok || !response.body) {
      const text = await response.text();
      throw new Error(`Morph API stream error (${response.status}): ${text}`);
    }

    logger.debug('Streaming response from Morph API');
    return Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
  }

  private performRequest(body: MorphChatCompletionRequest): Promise<Response> {
    const base = this.config.baseUrl.endsWith('/') ? this.config.baseUrl : `${this.config.baseUrl}/`;
    const endpoint = new URL('chat/completions', base);

    logger.debug('Sending request to Morph API', {
      url: endpoint.toString(),
      model: body.model,
      stream: body.stream,
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };

    if (process.env.OPENROUTER_REFERRER) {
      headers['HTTP-Referer'] = process.env.OPENROUTER_REFERRER;
    }

    if (process.env.OPENROUTER_TITLE) {
      headers['X-Title'] = process.env.OPENROUTER_TITLE;
    }

    return fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }
}
