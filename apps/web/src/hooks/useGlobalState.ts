'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * A custom React hook for managing global state using `react-query`.
 *
 * @template T - The type of the state value.
 *
 * @param {string[]} key - The unique key used to identify the global state in the `react-query` cache.
 * @param {T} initialValue - The initial value of the global state if it is not already in the cache.
 * @returns {[T, (newValue: T | ((prev: T) => T)) => void]} - A tuple containing:
 *   - The current state value.
 *   - A setter function to update the state.
 *
 * @description
 * This hook leverages `react-query` to manage global state across the application. It provides a simple
 * interface for accessing and updating state that is shared between components. The state is stored in
 * the `react-query` cache and can be accessed using the provided `key`.
 *
 * Features:
 * - Initializes the state with the provided `initialValue` if it is not already in the cache.
 * - Ensures the state is treated as always fresh by setting `staleTime` to `Infinity`.
 * - Prevents automatic refetching by disabling the query with `enabled: false`.
 * - Provides a setter function to update the state, supporting both direct values and updater functions.
 *
 * @example
 * // Example usage:
 * const [count, setCount] = useGlobalState<number>(['count'], 0);
 *
 * // Access the current state
 * console.log(count); // 0
 *
 * // Update the state
 * setCount(5);
 * setCount((prev) => prev + 1);
 */
export function useGlobalState<T>(
  key: string[],
  initialValue: T
): [T, (newValue: T | ((prev: T) => T)) => void] {
  const queryClient = useQueryClient();

  // Fetch the global state or set the initial value if it's not in the cache
  const { data: state } = useQuery<T>({
    queryKey: key,
    queryFn: () => initialValue,
    staleTime: Infinity, // Ensures the data is treated as always fresh
    enabled: false, // Prevents the query from automatically refetching
  });

  // Setter function to update the global state
  const setState = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      queryClient.setQueryData<T>(key, (oldValue) =>
        typeof newValue === 'function' ? (newValue as (prev: T) => T)(oldValue as T) : newValue
      );
    },
    [key, queryClient]
  );

  return [state ?? initialValue, setState];
}
