import {
  ApiFetchArgs,
  BaseApiFetchArgs,
  Collection,
  CollectionSlug,
  CreateArgs,
  CreateFileArgs,
  CreateResult,
  FetchGetResult,
  FileCollectionSlug,
  FindArgs,
  FindByIDArgs,
  FindResult,
  GetPreference,
  UpdateByIDArgs,
  UpdateByIDResult,
  UpdatePreference,
} from '@lactalink/types';
import { ApiClientConfig, IApiClient } from '@lactalink/types/interfaces';
import { mergeHeaders } from '@lactalink/utilities';
import { SupabaseClient } from '@supabase/supabase-js';
import { stringify } from 'qs-esm';
import { AuthClient } from './auth/AuthClient';
import { apiFetch } from './utils/apiFetch';

export class ApiClient implements IApiClient {
  private url: string | URL;
  private bypassToken?: string;
  private headers: Headers;
  private appEnvironment: ApiClientConfig['environment'];
  private supabaseClient: SupabaseClient | (() => SupabaseClient);
  public readonly auth: AuthClient;

  constructor(config: ApiClientConfig) {
    this.url = config.apiUrl;
    this.bypassToken = config.bypassToken;
    this.headers = new Headers({ 'Content-Type': 'application/json' });
    this.appEnvironment = config.environment;
    this.supabaseClient = config.supabase;

    this.auth = new AuthClient(
      this._getBaseFetchOptions,
      this.getSupabaseClient,
      config.environment
    );
  }

  // PRIVATE METHODS (arrow functions to preserve 'this' context)

  private _getBaseFetchOptions = (): Omit<BaseApiFetchArgs, 'token'> => {
    return {
      url: this.url,
      bypassToken: this.bypassToken,
      headers: this.headers,
    };
  };

  private _getFetchOptions = async (): Promise<BaseApiFetchArgs> => {
    const token = await this.auth?.getToken();
    const baseOptions = this._getBaseFetchOptions();
    return { ...baseOptions, token };
  };

  /**
   * Common method to handle API requests with error handling
   */
  private _makeApiRequest = async <TResponse>(
    endpoint: string,
    method: ApiFetchArgs<CollectionSlug>['method'],
    body?: ApiFetchArgs<CollectionSlug>['body'],
    customHeaders?: Headers
  ): Promise<TResponse> => {
    const options = await this._getFetchOptions();
    const { url: apiUrl, ...restOfFetchOptions } = options;

    const url = new URL(endpoint, apiUrl);
    const headers = customHeaders || options.headers;

    const res = await apiFetch<TResponse>({
      ...restOfFetchOptions,
      url,
      headers,
      method,
      ...(body && { body }),
    });

    if ('error' in res) {
      throw new Error(res.message);
    }

    return res.data;
  };

  /**
   * Builds URL with query parameters
   */
  private _buildUrlWithQuery = (
    basePath: string,
    searchParams: Record<string, unknown>
  ): string => {
    const query = stringify(searchParams);
    return query ? `${basePath}?${query}` : basePath;
  };

  // PUBLIC METHODS (arrow functions to preserve 'this' context)

  getSupabaseClient = (): SupabaseClient => {
    if (typeof this.supabaseClient === 'function') {
      // Create fresh client for each request (perfect for Next.js SSR)
      return this.supabaseClient();
    } else {
      // Use static client (good for Expo)
      return this.supabaseClient;
    }
  };

  setBypassToken = (bypassToken?: string): void => {
    this.bypassToken = bypassToken;
  };

  updateHeaders = (headers: Headers): void => {
    this.headers = mergeHeaders(this.headers, headers);
  };

  setHeaders = (headers: Headers): void => {
    this.headers = headers;
  };

  getHeaders = (): Headers => {
    return this.headers;
  };

  // Utility methods
  getAppEnvironment = (): ApiClientConfig['environment'] => {
    return this.appEnvironment;
  };

  isExpoApp = (): boolean => {
    return this.getAppEnvironment() === 'expo';
  };

  isNextJsApp = (): boolean => {
    return this.getAppEnvironment() === 'nextjs';
  };

  find = async <Slug extends CollectionSlug, IsPaginated extends boolean = true>(
    args: FindArgs<Slug, IsPaginated>
  ): Promise<FindResult<Slug, IsPaginated>> => {
    const { collection, ...searchParams } = args;

    const endpoint = this._buildUrlWithQuery(`/api/${collection}`, searchParams);

    const result = await this._makeApiRequest<FetchGetResult<Collection<Slug>>>(endpoint, 'GET');

    return (searchParams.pagination ? result : result.docs) as FindResult<Slug, IsPaginated>;
  };

  findByID = async <Slug extends CollectionSlug>(
    args: FindByIDArgs<Slug>
  ): Promise<Collection<Slug>> => {
    const { collection, id, ...searchParams } = args;
    const queryParams = { ...searchParams, pagination: false };
    const endpoint = this._buildUrlWithQuery(`/api/${collection}/${id}`, queryParams);

    return this._makeApiRequest<Collection<Slug>>(endpoint, 'GET');
  };

  create = async <Slug extends CollectionSlug>(
    args: CreateArgs<Slug>
  ): Promise<Collection<Slug>> => {
    const { collection, data, ...searchParams } = args;
    const endpoint = this._buildUrlWithQuery(`/api/${collection}`, searchParams);

    const result = await this._makeApiRequest<CreateResult<Collection<Slug>>>(
      endpoint,
      'POST',
      data
    );
    return result.doc;
  };

  createFile = async <Slug extends FileCollectionSlug>(
    args: CreateFileArgs<Slug>
  ): Promise<Collection<Slug>> => {
    const { collection, data } = args;

    // Create custom headers for file upload
    const options = await this._getFetchOptions();
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'multipart/form-data');

    const result = await this._makeApiRequest<CreateResult<Collection<Slug>>>(
      `/api/${collection}`,
      'POST',
      data,
      headers
    );
    return result.doc;
  };

  updateByID = async <Slug extends CollectionSlug>(
    args: UpdateByIDArgs<Slug>
  ): Promise<Collection<Slug>> => {
    const { collection, data, id, ...searchParams } = args;
    const endpoint = this._buildUrlWithQuery(`/api/${collection}/${id}`, searchParams);

    const result = await this._makeApiRequest<UpdateByIDResult<Collection<Slug>>>(
      endpoint,
      'PATCH',
      data
    );
    return result.doc;
  };

  getPreference = async <TValue = unknown>(key: string): Promise<TValue> => {
    const endpoint = `/api/payload-preferences/${key}`;
    const result = await this._makeApiRequest<GetPreference<TValue>>(endpoint, 'GET');
    return result.value;
  };

  updatePreference = async <TValue = unknown>(key: string, value: TValue): Promise<TValue> => {
    const endpoint = `/api/payload-preferences/${key}`;
    const data = { value };
    const result = await this._makeApiRequest<UpdatePreference<TValue>>(endpoint, 'POST', data);
    return result.doc.value;
  };
}
