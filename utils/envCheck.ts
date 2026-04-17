/* eslint-disable @typescript-eslint/naming-convention */
export function isDefined(name: string): boolean {
  return typeof (globalThis as Record<string, unknown>)[name] !== "undefined";
}

export function isDev(): boolean {
  if (typeof window !== "undefined") {
    return window.location.hostname.includes("dev");
  }
  return false;
}