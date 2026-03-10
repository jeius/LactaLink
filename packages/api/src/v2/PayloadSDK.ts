import type { BaseApiFetchArgs } from '@lactalink/types/api';
import type { Config } from '@lactalink/types/payload-generated-types';
import { mergeHeaders } from '@lactalink/utilities';
import { PayloadSDK as Payload } from '@payloadcms/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { ApiClientConfig } from '../interfaces';
import { AuthClient } from './AuthClient';

export class PayloadSDK<T extends Config = Config> extends Payload<T> {
  private url: string | URL;
  private bypassToken?: string;
  private headers: Headers;
  private appEnvironment: ApiClientConfig['environment'];
  private supabaseClient: SupabaseClient | (() => SupabaseClient);
  public readonly auth: AuthClient;

  constructor(config: ApiClientConfig) {
    const baseURL = new URL('/api', config.apiUrl).toString();

    super({
      baseURL: baseURL,
      fetch: async (url, init) => {
        const { token, bypassToken, ...options } = await this.getFetchOptions();
        const headers = new Headers(options.headers);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        if (bypassToken) headers.set('x-vercel-protection-bypass', bypassToken);
        const mergedHeaders = mergeHeaders(headers, new Headers(init?.headers));
        return fetch(url, { ...init, headers: mergedHeaders });
      },
    });

    this.url = baseURL;
    this.bypassToken = config.bypassToken;
    this.headers = new Headers({ 'Content-Type': 'application/json' });
    this.appEnvironment = config.environment;
    this.supabaseClient = config.supabase;

    this.auth = new AuthClient(
      this._getBaseFetchOptions,
      this.getSupabaseClient,
      this as unknown as PayloadSDK<Config>,
      config.environment
    );
  }

  private _getBaseFetchOptions = (): Omit<BaseApiFetchArgs, 'token'> => {
    return {
      url: this.url,
      bypassToken: this.bypassToken,
      headers: this.headers,
    };
  };

  // PUBLIC METHODS (arrow functions to preserve 'this' context)

  // Utility methods
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

  setBypassToken = (bypassToken?: string) => {
    this.bypassToken = bypassToken;
  };

  updateHeaders = (headers: Headers) => {
    this.headers = mergeHeaders(this.headers, headers);
  };

  setHeaders = (headers: Headers) => {
    this.headers = headers;
  };

  getHeaders = () => {
    return this.headers;
  };
}
