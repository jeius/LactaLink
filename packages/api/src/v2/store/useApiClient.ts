import { ApiClientConfig } from '@/interfaces';
import { isServerEnvironment } from '@/utils/getEnvironment';
import { ApiClient } from '@/v2/ApiClient';
import { Config } from '@lactalink/types/payload-generated-types';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

function createApiClient(config: ApiClientConfig) {
  const appEnv = config.environment;
  const isServer = isServerEnvironment(appEnv);

  // Validate environment context
  if (appEnv === 'nextjs') {
    // Next.js can run on both client and server
    if (isServer) {
      console.log('Creating server API client for Next.js');
    } else {
      console.log('Creating API client for Next.js');
    }
  } else if (appEnv === 'expo') {
    // Expo should always be client-side
    if (isServer) {
      throw new Error('Expo app detected in server environment - this should not happen');
    }
    console.log('Creating API client for Expo');
  }

  return new ApiClient(config);
}

interface ApiClientStore<T extends Config = Config> {
  client: ApiClient<T> | null;
  serverClient: ApiClient<T> | null;
  hasInitialized: boolean;
  isServer: boolean;
  init: (config: ApiClientConfig) => void;
  initServer: (config: ApiClientConfig) => void;
  reset: () => void;
}

export const useStoreApiClient = create<ApiClientStore>()(
  subscribeWithSelector((set, get) => ({
    client: null,
    serverClient: null,
    hasInitialized: false,
    isServer: typeof window === 'undefined',

    init: (config: ApiClientConfig) => {
      const isServerEnv = isServerEnvironment(config.environment);

      if (isServerEnv) {
        console.warn('Client init called on server. Use initServer() instead.');
        return;
      }

      const state = get();
      if (state.hasInitialized && state.client) {
        console.warn('Client API has already been initialized.');
        return;
      }

      try {
        const client = createApiClient(config);
        set({
          client,
          hasInitialized: true,
          isServer: false,
        });
        console.log('✅ Client API initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize client API:', error);
        throw error;
      }
    },

    initServer: (config: ApiClientConfig) => {
      const isServerEnv = isServerEnvironment(config.environment);

      if (!isServerEnv) {
        console.warn('Server init called on client. Use init() instead.');
        return;
      }

      const { serverClient } = get();

      if (serverClient) {
        serverClient.setSupabaseClient(config.supabase);
        return;
      }

      try {
        const serverClient = createApiClient(config);
        set({
          serverClient,
          hasInitialized: true,
          isServer: true,
        });
        console.log('✅ Server API initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize server API:', error);
        throw error;
      }
    },

    reset: () => {
      set({
        client: null,
        serverClient: null,
        hasInitialized: false,
      });
    },
  }))
);
