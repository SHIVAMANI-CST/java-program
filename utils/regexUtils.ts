// utils/regexUtils.ts

export const REGEX = {
  NON_DIGIT: /\D/g,
  PHONE_NUMBER: /^\d{10}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  EMAIL: /^[a-z0-9._+]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
};

export const removeNonDigits = (value: string): string =>
  value.replace(REGEX.NON_DIGIT, "");

export const stripAsterisk = (label: string): string =>
  label.replace(/\*$/, "");

export const removeSpaces = (value: string): string => 
  value.replace(/\s/g, "");
