import logger from "./logger/browserLogger";

type StorableValue = string | number | boolean | object | null;

const localStorageUtils = {
  setItem<T extends StorableValue>(key: string, value: T): void {
    try {
      const data = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, data);
    } catch (error) {
      logger.error("Failed to set localStorage item:", error);
    }
  },

  getItem<T = unknown>(key: string): T | string | null {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value;
      }
    } catch (error) {
      logger.error("Failed to get localStorage item:", error);
      return null;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error("Failed to remove localStorage item:", error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      logger.error("Failed to clear localStorage:", error);
    }
  },
};

export default localStorageUtils;
