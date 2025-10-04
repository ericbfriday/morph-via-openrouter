import http, { IncomingMessage, Server, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

import { handleEditRequest, handleEditStream } from './handler.js';
import { logger } from './logger.js';
import { EditFileRequest, ServerConfig } from './types.js';

export async function startServer(config: ServerConfig): Promise<Server> {
  const server = http.createServer(async (req, res) => {
    try {
      await routeRequest(config, req, res);
    } catch (error) {
      logger.error('Unhandled server error', error);
      sendJson(res, 500, { error: 'Internal server error' });
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(config.port, () => {
      logger.info(`Morph MCP server listening on http://localhost:${config.port}`);
      resolve();
    });
  });

  return server;
}

async function routeRequest(config: ServerConfig, req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!req.url) {
    sendJson(res, 400, { error: 'Invalid request' });
    return;
  }

  const url = new URL(req.url, `http://localhost:${config.port}`);

  if (req.method === 'POST' && url.pathname === '/edit_file') {
    const body = await readRequestBody(req);
    let payload: EditFileRequest;

    try {
      payload = JSON.parse(body) as EditFileRequest;
    } catch (error) {
      logger.warn('Failed to parse JSON body', error);
      sendJson(res, 400, { error: 'Malformed JSON body' });
      return;
    }

    const streamRequested = payload.stream === true;
    if (streamRequested) {
      await handleStreamingEdit(config, payload, res);
    } else {
      await handleStandardEdit(config, payload, res);
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

async function handleStandardEdit(config: ServerConfig, payload: EditFileRequest, res: ServerResponse): Promise<void> {
  try {
    const result = await handleEditRequest(config, payload);
    sendJson(res, 200, result);
  } catch (error) {
    logger.error('Edit request failed', error);
    sendJson(res, 400, { error: (error as Error).message });
  }
}

async function handleStreamingEdit(config: ServerConfig, payload: EditFileRequest, res: ServerResponse): Promise<void> {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    'Transfer-Encoding': 'chunked',
  });

  try {
    const stream = await handleEditStream(config, payload);
    await pipeline(stream, res);
  } catch (error) {
    logger.error('Streaming edit failed', error);
    res.write(`event: error\ndata: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
    res.end();
  }
}

async function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let data = '';

    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}
