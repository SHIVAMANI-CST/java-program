/* eslint-disable @typescript-eslint/naming-convention */
// function to format a element with dots
export function maskKey(key: string): string {
  if (!key) return "";

  const visibleChars = 4;

  if (key.length <= visibleChars * 2) {
    return "*".repeat(key.length);
  }

  const first = key.slice(0, visibleChars);
  const last = key.slice(-visibleChars);
  const middleLength = key.length - visibleChars * 2;
  const masked = "*".repeat(middleLength);

  return `${first}${masked}${last}`;
}
