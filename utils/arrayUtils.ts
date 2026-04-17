// checks if the given value is a non-empty array
export const isValidArray = <T>(arr: unknown): arr is T[] =>
  Array.isArray(arr) && arr.length > 0;

// Sorts array of objects alphabetically by a given key (default: "label")
export const sortByLabel = <T extends Record<string, unknown>>(
  array: T[],
  key: string = "label"
): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue);
    }
    return 0;
  });
};
