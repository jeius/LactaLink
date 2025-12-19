import { setMeOnline } from '@/lib/stores/presenceStore';
import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { useAppState } from './useAppState';

/**
 * Manages the `online`/`offline` status of the app and updates the presence store accordingly.
 * This hook sets the user as online when the app is in the foreground and offline when it goes to the background.
 *
 * @description This hook should be used at the root level of the app to ensure proper tracking of online status.
 */
export function useOnlineManager() {
  // Initialize online status on mount
  useEffect(() => {
    const currentState = AppState.currentState;
    if (currentState === 'active') {
      setMeOnline(true).catch((err) => console.error('Failed to set online:', err));
    }
  }, []);

  // Listen for app state changes
  useAppState(
    useCallback((state) => {
      switch (state) {
        case 'active':
          setMeOnline(true).catch((err) => console.error('Failed to set online:', err));
          break;
        case 'background':
        case 'inactive':
        default:
          setMeOnline(false).catch((err) => console.error('Failed to set offline:', err));
          break;
      }
    }, [])
  );

  // Handle network changes
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      const isOnline = !!state.isConnected && !!state.isInternetReachable;
      if (Platform.OS !== 'web') onlineManager.setOnline(isOnline);
    });
  }, []);
}
