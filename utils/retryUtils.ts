// utils/retryUtils.js

/**
 * Calculates exponential backoff delay with a cap.
 * @param {number} attemptIndex - The current retry attempt index (starting at 0).
 * @param {number} baseDelay - Initial delay in ms (default: 1000).
 * @param {number} maxDelay - Maximum allowed delay in ms (default: 30000).
 * @returns {number} - Computed delay in milliseconds.
 */
export const calculateRetryDelay = (
  attemptIndex: number,
  baseDelay = 1000,
  maxDelay = 30000
) => {
  return Math.min(baseDelay * 2 ** attemptIndex, maxDelay);
};
