import { create } from 'zustand';
import { ApiClient } from '../ApiClient';

interface ApiClientStore {
  client: ApiClient | null;
  hasInitialized: boolean;
  init: (url: string, token?: string | null, bypassToken?: string) => void;
}

export const useApiClient = create<ApiClientStore>((set, get) => ({
  client: null,
  hasInitialized: false,
  init: (url, token, bypassToken) => {
    if (get().hasInitialized) {
      console.warn('API client has already been initialized.');
      return;
    }

    const client = new ApiClient(url, token, bypassToken);
    set({ client, hasInitialized: true });
  },
}));

const ERROR_MESSAGE = 'API client is not initialized. Call useApiClient.init() first.';

export const getApiClient = (): ApiClient => {
  const state = useApiClient.getState();
  if (!state.client) {
    throw new Error(ERROR_MESSAGE);
  }
  return state.client;
};

export const useSafeApiClient = (): ApiClient => {
  const client = useApiClient((s) => s.client);
  if (!client) throw new Error(ERROR_MESSAGE);
  return client;
};
