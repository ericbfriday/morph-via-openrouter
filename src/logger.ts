export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const levelFromEnv = (process.env.LOG_LEVEL as LogLevel | undefined) ?? 'info';
const threshold = LEVELS[levelFromEnv] ?? LEVELS.info;

function log(level: LogLevel, message: string, meta?: unknown): void {
  if (LEVELS[level] < threshold) {
    return;
  }

  const time = new Date().toISOString();
  if (meta) {
    console[level](`[${time}] [${level.toUpperCase()}] ${message}`, meta);
  } else {
    console[level](`[${time}] [${level.toUpperCase()}] ${message}`);
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => log('debug', message, meta),
  info: (message: string, meta?: unknown) => log('info', message, meta),
  warn: (message: string, meta?: unknown) => log('warn', message, meta),
  error: (message: string, meta?: unknown) => log('error', message, meta),
};
