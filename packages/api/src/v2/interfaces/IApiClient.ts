import { ApiClientConfig } from '@/interfaces';
import { BaseApiFetchArgs } from '@lactalink/types/api';
import { SupabaseClient } from '@supabase/supabase-js';
import { Config } from '../payload-types';
import { IPayloadSDK } from './IPayloadSDK';

export interface IApiClient<T extends Config = Config> extends IPayloadSDK<T> {
  /**
   * Gets the fetch options to be used for API requests. This method can be used
   * to retrieve any necessary headers, tokens, or other options that should be included
   *  in API requests.
   *
   * @returns A promise that resolves to an object containing the fetch options for API requests.
   */
  getFetchOptions(): Promise<BaseApiFetchArgs>;

  /**
   * Gets the current application environment.
   * @returns The application environment string (e.g., 'expo', 'nextjs', 'node')
   */
  getAppEnvironment(): ApiClientConfig['environment'];

  /**
   * Checks if the current environment is an Expo app.
   * @returns True if running in Expo environment, false otherwise
   */
  isExpoApp(): boolean;

  /**
   * Checks if the current environment is a Next.js app.
   * @returns True if running in Next.js environment, false otherwise
   */
  isNextJsApp(): boolean;

  /**
   * Supabase client instance for database operations.
   * This client is used for direct database interactions.
   * @returns SupabaseClient instance
   */
  getSupabaseClient(): SupabaseClient;

  /**
   * Sets the Supabase client instance.
   *
   * @param supabase - The Supabase client instance or a function that returns it.
   */
  setSupabaseClient(supabase: SupabaseClient | (() => SupabaseClient)): void;
}
