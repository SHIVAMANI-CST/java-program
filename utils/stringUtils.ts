// utils/stringUtils.js

/**
 * Splits a string once on the first occurrence of a separator.
 * @param {string} str - The string to split.
 * @param {string} separator - The separator to split on.
 * @returns {[string, string]} A tuple of [before, after]
 */

export const safeSplit = (str: string, separator: string): string[] =>
  typeof str === "string" ? str.split(separator) : [];
