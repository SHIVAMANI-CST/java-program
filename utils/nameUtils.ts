export const splitFullName = (
  fullName: string
): { firstName: string; lastName: string } => {
  const trimmedName = fullName?.trim();
  const spaceIndex = trimmedName.indexOf(" ");

  if (spaceIndex === -1) {
    return {
      firstName: trimmedName,
      lastName: "",
    };
  }
  const firstName = trimmedName.substring(0, spaceIndex);
  const lastName = trimmedName.substring(spaceIndex + 1)?.trim();

  return {
    firstName,
    lastName,
  };
};

export const combineFullName = (
  firstName: string = "",
  lastName: string = ""
): string => {
  const trimmedFirst = firstName?.trim();
  const trimmedLast = lastName?.trim();

  if (!trimmedFirst && !trimmedLast) return "";
  if (!trimmedFirst) return trimmedLast;
  if (!trimmedLast) return trimmedFirst;

  return `${trimmedFirst} ${trimmedLast}`;
};
