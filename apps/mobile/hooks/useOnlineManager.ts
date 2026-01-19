import { useMeUserStore } from '@/lib/stores/meUserStore';
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
  const user = useMeUserStore((s) => s.meUser);

  // Initialize online status on mount
  useEffect(() => {
    const currentState = AppState.currentState;
    if (currentState === 'active' && user) {
      setMeOnline(true, user).catch((err) => console.error('Failed to set online:', err));
    }
  }, [user]);

  // Listen for app state changes
  useAppState(
    useCallback(
      (state) => {
        if (!user) return;
        switch (state) {
          case 'active':
            setMeOnline(true, user).catch((err) => console.error('Failed to set online:', err));
            break;
          case 'background':
          case 'inactive':
          default:
            setMeOnline(false, user).catch((err) => console.error('Failed to set offline:', err));
            break;
        }
      },
      [user]
    )
  );

  // Handle network changes
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      const isOnline = !!state.isConnected && !!state.isInternetReachable;
      if (Platform.OS !== 'web') onlineManager.setOnline(isOnline);
    });
  }, []);
}
