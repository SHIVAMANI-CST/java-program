import pino from "pino";

/* eslint-disable no-console */
function safeLog(...args: Parameters<typeof console.log>) {
  console.log(...args);
}
/* eslint-enable no-console */

const baseLogger = pino({
  browser: {
    asObject: true,
    write: (log) => {
      if (process.env.NODE_ENV === "development") {
        safeLog("[Client Log]", log);
      }
    },
  },
});

const wrap =
  (level: "info" | "warn" | "error") =>
  (msgOrErr: unknown, maybeData?: unknown) => {
    if (msgOrErr instanceof Error) {
      baseLogger[level]({ err: msgOrErr.stack || msgOrErr.message });
    } else if (typeof msgOrErr === "string") {
      if (maybeData instanceof Error) {
        baseLogger[level](
          { err: maybeData.stack || maybeData.message },
          msgOrErr
        );
      } else if (maybeData !== undefined) {
        baseLogger[level]({ data: maybeData }, msgOrErr);
      } else {
        baseLogger[level](msgOrErr);
      }
    } else {
      baseLogger[level]({ data: msgOrErr });
    }
  };

const logger = {
  ...baseLogger,
  info: wrap("info"),
  warn: wrap("warn"),
  error: wrap("error"),
};

export default logger;
