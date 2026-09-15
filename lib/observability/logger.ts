type LogFields = Record<string, unknown>;

const LEVELS = ["debug", "info", "warn", "error"] as const;
type Level = (typeof LEVELS)[number];

const currentLevel: Level = (process.env.LOG_LEVEL as Level) ?? "info";

function shouldLog(level: Level): boolean {
  return LEVELS.indexOf(level) >= LEVELS.indexOf(currentLevel);
}

// Never log secrets. Callers pass structured fields; this list is
// stripped defensively in case a caller accidentally includes one.
const REDACT_KEYS = ["apiKey", "api_key", "password", "secret", "token", "authorization"];

function redact(fields: LogFields): LogFields {
  const out: LogFields = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = REDACT_KEYS.some((r) => k.toLowerCase().includes(r)) ? "[redacted]" : v;
  }
  return out;
}

function emit(level: Level, fields: LogFields, message: string) {
  if (!shouldLog(level)) return;
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...redact(fields)
  };
  // eslint-disable-next-line no-console
  console[level === "debug" ? "log" : level](JSON.stringify(entry));
}

export const logger = {
  debug: (fields: LogFields, message: string) => emit("debug", fields, message),
  info: (fields: LogFields, message: string) => emit("info", fields, message),
  warn: (fields: LogFields, message: string) => emit("warn", fields, message),
  error: (fields: LogFields, message: string) => emit("error", fields, message)
};
