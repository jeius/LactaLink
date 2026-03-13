import { App } from '@/components/App';
import { AppInitializer } from '@/components/AppInitializer';
import { AppProvider } from '@/components/AppProvider';
import { API_URL, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { initApiClient } from '@lactalink/api';
import { fetch as expoFetch, FetchRequestInit } from 'expo/fetch';
import { enableMapSet } from 'immer';

import '@/global.css';
import 'react-native-get-random-values';

import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

initApiClient({
  apiUrl: API_URL,
  supabase,
  environment: 'expo',
  bypassToken: VERCEL_BYPASS_TOKEN,
  fetch: (url, init) => expoFetch(url.toString(), init as FetchRequestInit),
});

// Enable Immer support for Map and Set
enableMapSet();

export default function RootLayout() {
  return (
    <AppProvider>
      <AppInitializer>
        <App />
      </AppInitializer>
    </AppProvider>
  );
}
