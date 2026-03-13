import type { BaseApiFetchArgs } from '@lactalink/types/api';

import { mergeHeaders } from '@lactalink/utilities';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthClient } from './AuthClient';
import { PayloadSDK } from './PayloadSDK';
import type { ApiClientConfig } from './interfaces';
import { IApiClient } from './interfaces';
import type { Config } from './payload-types';

export class ApiClient<T extends Config = Config> extends PayloadSDK<T> implements IApiClient<T> {
  private bypassToken?: string;
  private appEnvironment: ApiClientConfig['environment'];
  private supabaseClient: SupabaseClient | (() => SupabaseClient);
  public readonly auth: AuthClient;

  constructor(config: ApiClientConfig) {
    const baseURL = new URL('/api', config.apiUrl).toString();
    const fetcher = config.fetch ?? fetch;

    super({
      baseURL: baseURL,
      fetch: async (url, init) => {
        const { token, bypassToken, ...options } = await this.getFetchOptions();
        const headers = new Headers(options.headers);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        if (bypassToken) headers.set('x-vercel-protection-bypass', bypassToken);
        const mergedHeaders = mergeHeaders(headers, new Headers(init?.headers));
        return fetcher(url, { ...init, headers: mergedHeaders });
      },
    });

    this.setHeaders(new Headers({ 'Content-Type': 'application/json' }));

    if (config.bypassToken) {
      this.setBypassToken(config.bypassToken);
    }

    this.appEnvironment = config.environment;
    this.supabaseClient = config.supabase;

    this.auth = new AuthClient(
      this.getSupabaseClient,
      this as unknown as PayloadSDK<Config>,
      config.environment
    );
  }

  private _getBaseFetchOptions = (): Omit<BaseApiFetchArgs, 'token'> => {
    return {
      url: this.baseURL,
      bypassToken: this.getBypassToken(),
      headers: this.getHeaders(),
    };
  };

  setBypassToken = (bypassToken?: string) => {
    this.bypassToken = bypassToken;
  };

  getBypassToken = () => {
    return this.bypassToken;
  };

  getAppEnvironment = () => {
    return this.appEnvironment;
  };

  getFetchOptions = async (): Promise<BaseApiFetchArgs> => {
    const token = await this.auth?.getToken();
    const baseOptions = this._getBaseFetchOptions();
    return { ...baseOptions, token };
  };

  isExpoApp = () => {
    return this.getAppEnvironment() === 'expo';
  };

  isNextJsApp = () => {
    return this.getAppEnvironment() === 'nextjs';
  };

  getSupabaseClient = () => {
    if (typeof this.supabaseClient === 'function') {
      // Create fresh client for each request (perfect for Next.js SSR)
      return this.supabaseClient();
    } else {
      // Use static client (good for Expo)
      return this.supabaseClient;
    }
  };

  setSupabaseClient = (supabase: SupabaseClient | (() => SupabaseClient)) => {
    this.supabaseClient = supabase;
  };
}
