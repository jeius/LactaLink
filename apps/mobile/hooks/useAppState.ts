import { useEffect } from 'react';
import type { AppStateStatus } from 'react-native';
import { AppState } from 'react-native';

/**
 * Tracks the app state changes and invokes the provided callback with the new state.
 * @description Make sure to wrap the callback in `useCallback` to avoid unnecessary re-subscribing.
 * @param callback Function to be called on app state change with the new state as argument.
 * @example
 * useAppState(
 *   useCallback((state) => {
 *     if (state === 'active') {
 *       // App has come to the foreground
 *     } else {
 *       // App has gone to the background or inactive
 *     }
 *   }, [])
 * );
 */
export function useAppState(callback: (status: AppStateStatus) => void) {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', callback);
    return () => {
      subscription.remove();
    };
  }, [callback]);
}
