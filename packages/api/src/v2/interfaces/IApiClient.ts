import { ApiClientConfig } from '@/interfaces';
import { BaseApiFetchArgs } from '@lactalink/types/api';
import { SupabaseClient } from '@supabase/supabase-js';
import { Config } from '../payload-types';
import { IPayloadSDK } from './IPayloadSDK';

export interface IApiClient<T extends Config = Config> extends IPayloadSDK<T> {
  getAppEnvironment(): ApiClientConfig['environment'];

  getFetchOptions(): Promise<BaseApiFetchArgs>;

  isExpoApp(): boolean;

  isNextJsApp(): boolean;

  getSupabaseClient(): SupabaseClient;

  setSupabaseClient(client: SupabaseClient | (() => SupabaseClient)): void;
}
