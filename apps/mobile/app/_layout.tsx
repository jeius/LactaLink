import { App } from '@/components/App';
import { AppInitializer } from '@/components/AppInitializer';
import { AppProvider } from '@/components/AppProvider';
import { API_URL, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { initApiClient } from '@lactalink/api';
import { ApiClientConfig } from '@lactalink/types/interfaces';

import '@/global.css';
import 'react-native-get-random-values';

import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const config: ApiClientConfig = {
  apiUrl: API_URL,
  supabase,
  environment: 'expo',
  bypassToken: VERCEL_BYPASS_TOKEN,
};

initApiClient(config);

export default function RootLayout() {
  return (
    <AppProvider>
      <AppInitializer>
        <App />
      </AppInitializer>
    </AppProvider>
  );
}
