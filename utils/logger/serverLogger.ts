// src/utils/logger.ts
import pino, { LoggerOptions } from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

// Pino Configuration
const pinoConfig: LoggerOptions = {
  // Set the base log level
  level: isDevelopment ? "debug" : "info", // 'debug' for dev, 'info' for production

  // Name the logger (optional, appears as 'name' field in JSON logs)
  name: "JoinGPT-app",

  // Ensure error objects are properly logged with stack traces
  serializers: {
    err: pino.stdSerializers.err,
    // You can add other serializers for req/res if logging HTTP requests/responses
    // req: pino.stdSerializers.req,
    // res: pino.stdSerializers.res,
  },

  // Base properties to add to all logs
  base: {
    env: process.env.NODE_ENV,
    // Add other relevant context here, like service name, instance ID, etc.
  },
};

let destinationStream: pino.DestinationStream = process.stdout; // Default to stdout

// If in development, configure pino-pretty for readable output
if (isDevelopment) {
  destinationStream = require("pino-pretty")({
    colorize: true,
    translateTime: "SYS:HH:MM:ss Z",
    ignore: "pid,hostname",
  });

  // pino.transport({
  //     target: 'pino-pretty',
  //     options: {
  //         colorize: true, // Enable colorful output
  //         translateTime: 'SYS:HH:MM:ss Z', // Human-readable timestamps
  //         ignore: 'pid,hostname', // Ignore fields common in JSON logs but not useful in console
  //     },
  // });
}
// In production, if not explicitly using a different transport,
// Pino will default to outputting raw JSON to process.stdout (which usually goes to console/container logs).
// No 'else' block needed here because `destinationStream` already defaults to `process.stdout`.

// Create the logger instance
const logger = pino(pinoConfig, destinationStream);

export default logger;