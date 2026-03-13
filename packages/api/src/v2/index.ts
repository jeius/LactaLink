/**
 * @fileoverview Client Factory for API Client Management
 *
 * This module provides a centralized factory for creating, managing, and accessing
 * API clients in both client-side and server-side environments. It handles the
 * complexity of universal rendering by providing separate client instances for
 * different execution contexts.
 *
 * Key Features:
 * - Universal API client support (client/server)
 * - Type-safe initialization and access
 * - React hooks for component integration
 * - Environment detection and validation
 * - Centralized error handling
 *
 * @author Julius Pahama <www.linkedin.com/in/julius-pahama>
 */

import { ApiClient } from '@/v2/ApiClient';
import { ApiClientConfig } from '@/v2/interfaces/ApiClientConfig';
import { MatchingService, TransactionService } from '@/v2/services';
import { useStoreApiClient } from '@/v2/store/useApiClient';

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/** Error thrown when client-side API client is not initialized */
const CLIENT_ERROR_MESSAGE =
  'Client API is not initialized. Call initApiClient() or useInitApiClient first.';

/** Error thrown when server-side API client is not initialized */
const SERVER_ERROR_MESSAGE = 'Server API is not initialized. Call initServerApiClient() first.';

/** Error thrown when trying to use client methods during SSR */
const SSR_ERROR_MESSAGE = 'Cannot use client API methods during SSR. Use server methods instead.';

// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Initializes the client-side API client.
 * Should be called once during application startup on the client.
 *
 * @param config - Configuration object containing API URL, Supabase client, etc.
 * @example
 * ```typescript
 * initApiClient({
 *   apiUrl: 'https://api.example.com',
 *   supabase: supabaseClient,
 *   bypassToken: 'optional-bypass-token'
 *   environment: 'nextjs' // or 'expo' for Expo apps
 * });
 * ```
 */
export function initApiClient(config: ApiClientConfig): void {
  useStoreApiClient.getState().init(config);
}

/**
 * Initializes the server-side API client.
 * Should be called once during application startup on the server.
 *
 * @param config - Configuration object containing API URL, Supabase client, etc.
 * @example
 * ```typescript
 * initServerApiClient({
 *   apiUrl: 'https://api.example.com',
 *   supabase: supabaseServerClient,
 *   bypassToken: 'server-bypass-token'
 *   environment: 'nextjs' // or 'expo' for Expo apps
 * });
 * ```
 */
export function initServerApiClient(config: ApiClientConfig): void {
  useStoreApiClient.getState().initServer(config);
}

// ============================================================================
// IMPERATIVE API CLIENT GETTERS
// ============================================================================

/**
 * Gets the client-side API client instance.
 * Throws an error if called on the server or if the client is not initialized.
 *
 * @returns The initialized client-side API client
 * @throws {Error} If called during SSR or client is not initialized
 * @example
 * ```typescript
 * const apiClient = getApiClient();
 * const users = await apiClient.find({ collection: 'users' });
 * ```
 */
export const getApiClient = (): ApiClient => {
  const state = useStoreApiClient.getState();

  if (state.isServer) {
    throw new Error(SSR_ERROR_MESSAGE);
  }

  if (!state.client) {
    throw new Error(CLIENT_ERROR_MESSAGE);
  }

  return state.client;
};

/**
 * Gets the server-side API client instance.
 * Throws an error if called on the client or if the server client is not initialized.
 *
 * @returns The initialized server-side API client
 * @throws {Error} If called on client-side or server client is not initialized
 * @example
 * ```typescript
 * // In a Next.js API route or server component
 * const apiClient = getServerApiClient();
 * const users = await apiClient.find({ collection: 'users' });
 * ```
 */
export const getServerApiClient = (): ApiClient => {
  const state = useStoreApiClient.getState();

  if (!state.isServer) {
    throw new Error('getServerApiClient can only be called on server');
  }

  if (!state.serverClient) {
    throw new Error(SERVER_ERROR_MESSAGE);
  }

  return state.serverClient;
};

/**
 * Gets the appropriate API client based on the current environment.
 * Automatically chooses between client and server instances.
 *
 * @returns The appropriate API client for the current environment
 * @throws {Error} If the appropriate client for the current environment is not initialized
 * @example
 * ```typescript
 * // Works in both client and server environments
 * const apiClient = getUniversalApiClient();
 * const users = await apiClient.find({ collection: 'users' });
 * ```
 */
export const getUniversalApiClient = () => {
  const state = useStoreApiClient.getState();

  if (state.isServer) {
    if (!state.serverClient) {
      throw new Error(SERVER_ERROR_MESSAGE);
    }
    return state.serverClient;
  } else {
    if (!state.client) {
      throw new Error(CLIENT_ERROR_MESSAGE);
    }
    return state.client;
  }
};

export const getMatchingService = () => {
  const client = getUniversalApiClient();
  return new MatchingService(client);
};

export const getTransactionService = () => {
  const client = getUniversalApiClient();
  return new TransactionService(client);
};

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * React hook for accessing the client-side API client.
 * Only works on the client-side, throws an error during SSR.
 *
 * @returns The initialized client-side API client
 * @throws {Error} If called during SSR or client is not initialized
 * @example
 * ```typescript
 * function UserList() {
 *   const apiClient = useSafeApiClient();
 *
 *   const fetchUsers = async () => {
 *     const users = await apiClient.find({ collection: 'users' });
 *     return users;
 *   };
 *
 *   // ... component logic
 * }
 * ```
 */
export const useApiClient = (): ApiClient => {
  const client = useStoreApiClient((s) => s.client);
  const isServer = useStoreApiClient((s) => s.isServer);

  if (isServer) {
    throw new Error(SSR_ERROR_MESSAGE);
  }

  if (!client) {
    throw new Error(CLIENT_ERROR_MESSAGE);
  }

  return client;
};

/**
 * React hook that provides the appropriate API client for the current environment.
 * Works in both client and server environments (SSR-safe).
 *
 * @returns The appropriate API client for the current environment
 * @throws {Error} If the appropriate client for the current environment is not initialized
 * @example
 * ```typescript
 * function UniversalUserList() {
 *   const apiClient = useUniversalApiClient();
 *
 *   const fetchUsers = async () => {
 *     // Works in both client and server components
 *     const users = await apiClient.find({ collection: 'users' });
 *     return users;
 *   };
 *
 *   // ... component logic
 * }
 * ```
 */
export const useUniversalApiClient = (): ApiClient => {
  const { client, serverClient, isServer } = useStoreApiClient((s) => ({
    client: s.client,
    serverClient: s.serverClient,
    isServer: s.isServer,
  }));

  if (isServer) {
    if (!serverClient) throw new Error(SERVER_ERROR_MESSAGE);
    return serverClient;
  } else {
    if (!client) throw new Error(CLIENT_ERROR_MESSAGE);
    return client;
  }
};

export const useMatchingService = (): MatchingService => {
  const client = useApiClient();
  return new MatchingService(client);
};

export const useTransactionService = (): TransactionService => {
  const client = useApiClient();
  return new TransactionService(client);
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * React hook to check if the API client has been initialized.
 * Useful for conditional rendering or loading states.
 *
 * @returns Boolean indicating whether the API client is initialized
 * @example
 * ```typescript
 * function App() {
 *   const isInitialized = useIsApiClientInitialized();
 *
 *   if (!isInitialized) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   return <MainApp />;
 * }
 * ```
 */
export const useIsApiClientInitialized = (): boolean => {
  return useStoreApiClient((s) => s.hasInitialized);
};

/**
 * React hook to determine if the code is running on the server.
 * Useful for conditional logic based on execution environment.
 *
 * @returns Boolean indicating whether the code is running on the server
 * @example
 * ```typescript
 * function MyComponent() {
 *   const isServer = useIsServer();
 *
 *   return (
 *     <div>
 *       Running on: {isServer ? 'Server' : 'Client'}
 *     </div>
 *   );
 * }
 * ```
 */
export const useIsServer = (): boolean => {
  return useStoreApiClient((s) => s.isServer);
};

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

/**
 * Resets the API client state, clearing all initialized clients.
 * Useful for testing or when reinitializing the application.
 *
 * @example
 * ```typescript
 * // In tests or during app reset
 * resetApiClient();
 * ```
 */
export const resetApiClient = (): void => {
  useStoreApiClient.getState().reset();
};

// ============================================================================
// EXPORTS
// ============================================================================
