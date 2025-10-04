export interface EditFileRequest {
  target_file: string;
  instructions: string;
  editSnippet: string;
  stream?: boolean;
}

export interface EditFileResponse {
  updatedCode: string;
  model: string;
  usage?: MorphUsage;
}

export interface MorphUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface ServerConfig {
  port: number;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface MorphChatCompletionRequest {
  model: string;
  messages: Array<MorphMessage>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface MorphMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MorphChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string | null;
    message: {
      role: 'assistant';
      content: string;
    };
  }>;
  usage?: MorphUsage;
}
