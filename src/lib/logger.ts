// src/lib/logger.ts
// Structured JSON logger with log levels

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getConfiguredLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel as LogLevel;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[getConfiguredLevel()];
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  [key: string]: unknown;
}

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (shouldLog("debug")) {
      console.info(JSON.stringify(formatLog("debug", message, meta)));
    }
  },

  info(message: string, meta?: Record<string, unknown>) {
    if (shouldLog("info")) {
      console.info(JSON.stringify(formatLog("info", message, meta)));
    }
  },

  warn(message: string, meta?: Record<string, unknown>) {
    if (shouldLog("warn")) {
      console.warn(JSON.stringify(formatLog("warn", message, meta)));
    }
  },

  error(message: string, meta?: Record<string, unknown>) {
    if (shouldLog("error")) {
      console.error(JSON.stringify(formatLog("error", message, meta)));
    }
  },
};

export default logger;
