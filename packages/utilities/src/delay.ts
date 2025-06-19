'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Delays the execution of code for a specified amount of time.
 *
 * This utility function creates a promise that resolves after the specified
 * number of milliseconds. It can be used to introduce delays in asynchronous
 * code, such as waiting before retrying a request or simulating network latency.
 *
 * @param ms - The number of milliseconds to delay.
 * @returns A promise that resolves after the specified delay.
 *
 * @example
 * ```typescript
 * // Wait for 2 seconds before executing the next line
 * await delay(2000);
 * console.log('2 seconds have passed');
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useDebounce<T>(
  value: T,
  delay = 300,
  options: { leading?: boolean; trailing?: boolean } = { leading: false, trailing: true }
): T {
  const { leading = false, trailing = true } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);
  const leadingCalledRef = useRef(false);

  useEffect(() => {
    const now = Date.now();

    // Handle leading edge
    if (leading && !leadingCalledRef.current) {
      setDebouncedValue(value);
      leadingCalledRef.current = true;
      lastCallTimeRef.current = now;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Handle trailing edge
    timeoutRef.current = setTimeout(() => {
      if (trailing && (!leading || now - (lastCallTimeRef.current || 0) >= delay)) {
        setDebouncedValue(value);
      }
      leadingCalledRef.current = false; // Reset leading call
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  return debouncedValue;
}
