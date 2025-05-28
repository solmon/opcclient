/**
 * Logger utility to manage log output across environments
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Set minimum log level based on environment
const MIN_LOG_LEVEL: { [key: string]: number } = {
  'debug': 0,
  'info': 1,
  'warn': 2,
  'error': 3
};

// Default to 'info' if not set
const currentLogLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || 'info';

/**
 * Logger class for consistent logging across the application
 */
class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Debug level logging
   */
  debug(...args: any[]): void {
    this.log('debug', ...args);
  }

  /**
   * Info level logging
   */
  info(...args: any[]): void {
    this.log('info', ...args);
  }

  /**
   * Warning level logging
   */
  warn(...args: any[]): void {
    this.log('warn', ...args);
  }

  /**
   * Error level logging
   */
  error(...args: any[]): void {
    this.log('error', ...args);
  }

  /**
   * Internal log method with level filtering
   */
  private log(level: LogLevel, ...args: any[]): void {
    // Skip if current log level is higher than this message's level
    if (MIN_LOG_LEVEL[level] < MIN_LOG_LEVEL[currentLogLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]:`;

    switch (level) {
      case 'error':
        console.error(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'info':
        console.info(prefix, ...args);
        break;
      case 'debug':
        console.debug(prefix, ...args);
        break;
    }
  }
}

/**
 * Create a logger for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}
