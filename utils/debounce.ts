export function debounce<CallbackFn extends (...args: any[]) => Promise<any> | void>(
  callback: CallbackFn,
  waitTimeMs = 800
) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<CallbackFn>) => {
    if (debounceTimer) clearTimeout(debounceTimer);

    return new Promise<ReturnType<CallbackFn>>((resolve) => {
      debounceTimer = setTimeout(async () => {
        const result = await callback(...args);
        resolve(result);
      }, waitTimeMs);
    });
  };
}

