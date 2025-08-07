import {
  ApiFetchArgs,
  ApiMethod,
  BaseApiFetchArgs,
  CollectionSlug,
  CreateOptions,
  CreateResult,
  DeleteByID,
  DeleteByIDResult,
  DeleteMany,
  DeleteManyResult,
  FileCollectionSlug,
  FindMany,
  FindManyResult,
  FindOne,
  FindOneResult,
  GetPreference,
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
  UpdateByID,
  UpdateByIDResult,
  UpdateMany,
  UpdateManyResult,
  UpdatePreference,
  UploadFile,
} from '@lactalink/types';
import { ApiClientConfig, IApiClient } from '@lactalink/types/interfaces';
import { mergeHeaders } from '@lactalink/utilities';
import { SupabaseClient } from '@supabase/supabase-js';
import { stringify } from 'qs';
import { PaginatedDocs } from '../../types/dist/payload-types/database';
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
  private _makeApiRequest = async <TData>(
    endpoint: string,
    method: ApiMethod,
    body?: ApiFetchArgs<CollectionSlug>['body'],
    customHeaders?: Headers
  ): Promise<TData> => {
    const options = await this._getFetchOptions();
    const { url: apiUrl, ...restOfFetchOptions } = options;

    const url = new URL(endpoint, apiUrl);
    const headers = customHeaders || options.headers;

    const res = await apiFetch<TData>({
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

  setSupabaseClient = (supabase: SupabaseClient | (() => SupabaseClient)): void => {
    this.supabaseClient = supabase;
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

  fetch = async <TData>(
    endpoint: string,
    options?: { method: ApiMethod; body?: Record<string, unknown>; headers?: Headers }
  ): Promise<TData> => {
    const fetchOptions = await this._getFetchOptions();
    const { url: apiUrl, ...restOfFetchOptions } = fetchOptions;
    const { method = 'GET', body } = options || {};

    const url = new URL(endpoint, apiUrl);
    const headers = options?.headers || fetchOptions.headers;

    const res = await apiFetch<TData>({
      ...restOfFetchOptions,
      url,
      headers,
      method: method,
      ...(body && { body: body }),
    });

    if ('error' in res) {
      throw new Error(res.message);
    }

    return res.data;
  };

  find = async <
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
    TPaginate extends boolean = boolean,
  >(
    args: FindMany<TSlug, TSelect>
  ): Promise<FindManyResult<TSlug, TSelect, TPaginate>> => {
    const { collection, ...searchParams } = args;

    const endpoint = this._buildUrlWithQuery(`/api/${collection}`, searchParams);

    const result = await this._makeApiRequest<
      PaginatedDocs<TransformCollectionWithSelect<TSlug, TSelect>>
    >(endpoint, 'GET');

    return (searchParams.pagination ? result : result.docs) as FindManyResult<
      TSlug,
      TSelect,
      TPaginate
    >;
  };

  findByID = async <
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: FindOne<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>> => {
    const { collection, id, ...searchParams } = args;
    const queryParams = { ...searchParams, pagination: false };
    const endpoint = this._buildUrlWithQuery(`/api/${collection}/${id}`, queryParams);

    return this._makeApiRequest<FindOneResult<TSlug, TSelect>>(endpoint, 'GET');
  };

  create = async <
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: CreateOptions<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>> => {
    const { collection, data, ...searchParams } = args;
    const endpoint = this._buildUrlWithQuery(`/api/${collection}`, searchParams);

    const result = await this._makeApiRequest<CreateResult<TSlug, TSelect>>(endpoint, 'POST', data);
    return result.doc;
  };

  uploadFile = async <
    TSlug extends FileCollectionSlug = FileCollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: UploadFile<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>> => {
    const { collection, data, file } = args;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('_payload', JSON.stringify(data));

    // Create custom headers for file upload
    const options = await this._getFetchOptions();
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'multipart/form-data');

    const result = await this._makeApiRequest<CreateResult<TSlug, TSelect>>(
      `/api/${collection}`,
      'POST',
      formData,
      headers
    );
    return result.doc;
  };

  update = async <
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: UpdateMany<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>[]> => {
    const { collection, data, ...searchParams } = args;
    const endpoint = this._buildUrlWithQuery(`/api/${collection}`, searchParams);
    const result = await this._makeApiRequest<UpdateManyResult<TSlug, TSelect>>(
      endpoint,
      'PATCH',
      data
    );
    return result.docs;
  };

  updateByID = async <
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: UpdateByID<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>> => {
    const { collection, data, id, ...searchParams } = args;
    const endpoint = this._buildUrlWithQuery(`/api/${collection}/${id}`, searchParams);
    const result = await this._makeApiRequest<UpdateByIDResult<TSlug, TSelect>>(
      endpoint,
      'PATCH',
      data
    );
    return result.doc;
  };

  delete = async <
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: DeleteMany<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>[]> => {
    const { collection, ...searchParams } = args;
    const endpoint = this._buildUrlWithQuery(`/api/${collection}`, searchParams);
    const result = await this._makeApiRequest<DeleteManyResult<TSlug, TSelect>>(endpoint, 'DELETE');
    return result.docs;
  };

  deleteByID = async <
    TSlug extends CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: DeleteByID<TSlug, TSelect>
  ): Promise<DeleteByIDResult<TSlug, TSelect>> => {
    const { collection, id, ...searchParams } = args;
    const endpoint = this._buildUrlWithQuery(`/api/${collection}/${id}`, searchParams);

    return this._makeApiRequest<DeleteByIDResult<TSlug, TSelect>>(endpoint, 'DELETE');
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
