export const parseMessage = (rawMessage: string | null): string => {
  if (!rawMessage) return "Unknown error occurred.";
  try {
    const parsed = JSON.parse(rawMessage);
    return parsed.message || parsed.error || rawMessage;
  } catch {
    return rawMessage;
  }
};
