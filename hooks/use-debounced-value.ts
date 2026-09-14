import { useEffect, useState } from 'react';

/**
 * Returns `value` once it has stopped changing for `delay` ms.
 *
 * Used for search boxes that query the server, so typing a name sends one
 * request when the user pauses rather than one per keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
