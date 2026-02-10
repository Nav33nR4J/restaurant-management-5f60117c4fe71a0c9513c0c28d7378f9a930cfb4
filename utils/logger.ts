/**
 * Logger Utility
 * Centralized logging for the application
 * Provides consistent logging across all modules
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Current log level - change to LogLevel.ERROR in production
let currentLogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.INFO;

/**
 * Set the current log level
 * @param level - Log level to set
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Get the current log level
 * @returns Current log level
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

/**
 * Log a debug message
 * @param tag - Source tag/module name
 * @param message - Message to log
 * @param data - Optional data to log
 */
export function debug(tag: string, message: string, data?: unknown): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.debug(`[DEBUG] [${tag}]`, message, data ?? "");
  }
}

/**
 * Log an info message
 * @param tag - Source tag/module name
 * @param message - Message to log
 * @param data - Optional data to log
 */
export function info(tag: string, message: string, data?: unknown): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.info(`[INFO] [${tag}]`, message, data ?? "");
  }
}

/**
 * Log a warning message
 * @param tag - Source tag/module name
 * @param message - Message to log
 * @param data - Optional data to log
 */
export function warn(tag: string, message: string, data?: unknown): void {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(`[WARN] [${tag}]`, message, data ?? "");
  }
}

/**
 * Log an error message
 * @param tag - Source tag/module name
 * @param message - Message to log
 * @param errorObj - Optional error object
 * @param data - Optional additional data
 */
export function logError(
  tag: string,
  message: string,
  errorObj?: unknown,
  data?: unknown
): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(`[ERROR] [${tag}]`, message, errorObj ?? "", data ?? "");
  }
}

/**
 * Log a group of related logs
 * @param tag - Source tag/module name
 * @param label - Group label
 * @param callback - Function containing grouped logs
 */
export function group(
  tag: string,
  label: string,
  callback: () => void
): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.group(`[${tag}] ${label}`);
    callback();
    console.groupEnd();
  }
}

/**
 * Log an error with stack trace
 * @param tag - Source tag/module name
 * @param message - Message to log
 * @param error - Error object
 */
export function errorWithStack(tag: string, message: string, error: Error): void {
  logError(tag, message, error, {
    stack: error.stack,
    name: error.name,
  });
}

/**
 * Log performance timing
 * @param tag - Source tag/module name
 * @param label - Timer label
 * @param startTime - Start time from performance.now()
 */
export function logPerformance(
  tag: string,
  label: string,
  startTime: number
): void {
  const duration = performance.now() - startTime;
  info(tag, `${label} completed in ${duration.toFixed(2)}ms`);
}

// Convenience loggers for specific modules
export const Loggers = {
  auth: {
    debug: (msg: string, data?: unknown) => debug("Auth", msg, data),
    info: (msg: string, data?: unknown) => info("Auth", msg, data),
    warn: (msg: string, data?: unknown) => warn("Auth", msg, data),
    error: (msg: string, errorObj?: unknown, data?: unknown) =>
      logError("Auth", msg, errorObj, data),
  },
  cart: {
    debug: (msg: string, data?: unknown) => debug("Cart", msg, data),
    info: (msg: string, data?: unknown) => info("Cart", msg, data),
    warn: (msg: string, data?: unknown) => warn("Cart", msg, data),
    error: (msg: string, errorObj?: unknown, data?: unknown) =>
      logError("Cart", msg, errorObj, data),
  },
  network: {
    debug: (msg: string, data?: unknown) => debug("Network", msg, data),
    info: (msg: string, data?: unknown) => info("Network", msg, data),
    warn: (msg: string, data?: unknown) => warn("Network", msg, data),
    error: (msg: string, errorObj?: unknown, data?: unknown) =>
      logError("Network", msg, errorObj, data),
  },
  navigation: {
    debug: (msg: string, data?: unknown) => debug("Navigation", msg, data),
    info: (msg: string, data?: unknown) => info("Navigation", msg, data),
    warn: (msg: string, data?: unknown) => warn("Navigation", msg, data),
    error: (msg: string, errorObj?: unknown, data?: unknown) =>
      logError("Navigation", msg, errorObj, data),
  },
  storage: {
    debug: (msg: string, data?: unknown) => debug("Storage", msg, data),
    info: (msg: string, data?: unknown) => info("Storage", msg, data),
    warn: (msg: string, data?: unknown) => warn("Storage", msg, data),
    error: (msg: string, errorObj?: unknown, data?: unknown) =>
      logError("Storage", msg, errorObj, data),
  },
  theme: {
    debug: (msg: string, data?: unknown) => debug("Theme", msg, data),
    info: (msg: string, data?: unknown) => info("Theme", msg, data),
    warn: (msg: string, data?: unknown) => warn("Theme", msg, data),
    error: (msg: string, errorObj?: unknown, data?: unknown) =>
      logError("Theme", msg, errorObj, data),
  },
  menu: {
    debug: (msg: string, data?: unknown) => debug("Menu", msg, data),
    info: (msg: string, data?: unknown) => info("Menu", msg, data),
    warn: (msg: string, data?: unknown) => warn("Menu", msg, data),
    error: (msg: string, errorObj?: unknown, data?: unknown) =>
      logError("Menu", msg, errorObj, data),
  },
  stock: {
    debug: (msg: string, data?: unknown) => debug("Stock", msg, data),
    info: (msg: string, data?: unknown) => info("Stock", msg, data),
    warn: (msg: string, data?: unknown) => warn("Stock", msg, data),
    error: (msg: string, errorObj?: unknown, data?: unknown) =>
      logError("Stock", msg, errorObj, data),
  },
  database: {
    debug: (msg: string, data?: unknown) => debug("Database", msg, data),
    info: (msg: string, data?: unknown) => info("Database", msg, data),
    warn: (msg: string, data?: unknown) => warn("Database", msg, data),
    error: (msg: string, errorObj?: unknown, data?: unknown) =>
      logError("Database", msg, errorObj, data),
  },
  flavor: {
    debug: (msg: string, data?: unknown) => debug("Flavor", msg, data),
    info: (msg: string, data?: unknown) => info("Flavor", msg, data),
    warn: (msg: string, data?: unknown) => warn("Flavor", msg, data),
    error: (msg: string, errorObj?: unknown, data?: unknown) =>
      logError("Flavor", msg, errorObj, data),
  },
};

