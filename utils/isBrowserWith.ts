// utils/isBrowserWith.ts
export const isBrowserWith = <K extends keyof Window>(prop: K): boolean => {
  return typeof window !== "undefined" && typeof window[prop] !== "undefined";
};
