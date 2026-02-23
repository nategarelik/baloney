// Structured logging utility
// In production: only warn+ level, never logs sensitive data
// In development: all levels with full details

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "warn" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL];
}

function formatMessage(level: LogLevel, context: string, message: string) {
  return `[Baloney:${level.toUpperCase()}] ${context}: ${message}`;
}

export const logger = {
  debug(context: string, message: string, data?: unknown) {
    if (!shouldLog("debug")) return;
    console.debug(formatMessage("debug", context, message), data ?? "");
  },

  info(context: string, message: string, data?: unknown) {
    if (!shouldLog("info")) return;
    console.info(formatMessage("info", context, message), data ?? "");
  },

  warn(context: string, message: string, data?: unknown) {
    if (!shouldLog("warn")) return;
    console.warn(formatMessage("warn", context, message), data ?? "");
  },

  error(context: string, message: string, error?: unknown) {
    if (!shouldLog("error")) return;
    const errorInfo =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error;
    console.error(formatMessage("error", context, message), errorInfo ?? "");
  },
};
