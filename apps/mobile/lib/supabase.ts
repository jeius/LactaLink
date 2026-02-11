import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';
import { MMKV_KEYS, SUPABASE_ANON_KEY, SUPABASE_URL } from './constants';
import { authStorage } from './localStorage';

const storage: SupportedStorage = {
  getItem: async (key: string) => {
    try {
      const value = authStorage.getString(key) || null;
      return value;
    } catch (error) {
      console.error('Error getting item from local storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      authStorage.set(key, value);
    } catch (error) {
      console.error('Error setting item in local storage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      authStorage.remove(key);
    } catch (error) {
      console.error('Error removing item from local storage:', error);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: MMKV_KEYS.AUTH,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
