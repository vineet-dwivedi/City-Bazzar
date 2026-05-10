export type LogLevel = "info" | "warn" | "error";

const serializeError = (error: unknown) =>
  error instanceof Error
    ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    : error;

// Tiny structured logger keeps production output readable and grep-friendly.
export const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta: JSON.parse(JSON.stringify(meta, (_key, value) => serializeError(value))) } : {})
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
    return;
  }

  console.log(output);
};
