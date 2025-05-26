import {
  ApiFetchArgs,
  BaseApiFetchArgs,
  Collection,
  CollectionSlug,
  CreateArgs,
  CreateFileArgs,
  CreateResult,
  FileCollectionSlug,
  FindArgs,
  FindByIDArgs,
  FindResult,
  GetPreference,
  SearchParams,
  UpdateByIDArgs,
  UpdateByIDResult,
  UpdatePreference,
} from '@lactalink/types';
import { ApiClientConfig, IApiClient } from '@lactalink/types/interfaces';
import { mergeHeaders } from '@lactalink/utilities';
import { stringify } from 'qs-esm';
import { AuthClient } from './auth/AuthClient';
import { getAppEnvironment } from './utils';
import { apiFetch } from './utils/apiFetch';

export class ApiClient implements IApiClient {
  private url: string | URL;
  private bypassToken?: string;
  private headers: Headers;
  public auth: AuthClient;

  constructor({ apiUrl, supabase, bypassToken }: ApiClientConfig) {
    this.url = apiUrl;
    this.bypassToken = bypassToken;
    this.headers = new Headers({
      'Content-Type': 'application/json',
    });
    this.auth = new AuthClient(this._getBaseFetchOptions, supabase.auth);
  }

  private _getBaseFetchOptions(): Omit<BaseApiFetchArgs, 'token'> {
    return {
      url: this.url,
      bypassToken: this.bypassToken,
      headers: this.headers,
    };
  }

  private async _getFetchOptions(): Promise<BaseApiFetchArgs> {
    const token = await this.auth?.getToken();
    const baseOptions = this._getBaseFetchOptions();
    return { ...baseOptions, token };
  }

  /**
   * Common method to handle API requests with error handling
   */
  private async _makeApiRequest<TResponse>(
    endpoint: string,
    method: ApiFetchArgs<CollectionSlug>['method'],
    body?: ApiFetchArgs<CollectionSlug>['body'],
    customHeaders?: Headers
  ): Promise<TResponse> {
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
  }

  /**
   * Builds URL with query parameters
   */
  private _buildUrlWithQuery<Slug extends CollectionSlug = CollectionSlug>(
    basePath: string,
    searchParams: SearchParams<Slug>
  ): string {
    const query = stringify(searchParams);
    return query ? `${basePath}?${query}` : basePath;
  }

  setBypassToken(bypassToken?: string) {
    this.bypassToken = bypassToken;
  }

  updateHeaders(headers: Headers) {
    this.headers = mergeHeaders(this.headers, headers);
  }

  setHeaders(headers: Headers) {
    this.headers = headers;
  }

  getHeaders() {
    return this.headers;
  }

  // Utility methods
  getAppEnvironment() {
    return getAppEnvironment();
  }

  isExpoApp() {
    return getAppEnvironment() === 'expo';
  }

  isNextJsApp() {
    return getAppEnvironment() === 'nextjs';
  }

  async find<Slug extends CollectionSlug, IsPaginated extends boolean = true>(
    args: FindArgs<Slug, IsPaginated>
  ): Promise<FindResult<Slug, IsPaginated>> {
    const { collection, pagination, page, ...searchParams } = args;

    const queryParams = pagination ? { ...searchParams, page } : searchParams;
    const endpoint = this._buildUrlWithQuery(`/api/${collection}`, queryParams);

    return this._makeApiRequest<FindResult<Slug, IsPaginated>>(endpoint, 'GET');
  }

  async findByID<Slug extends CollectionSlug>(args: FindByIDArgs<Slug>): Promise<Collection<Slug>> {
    const { collection, id, ...searchParams } = args;
    const endpoint = this._buildUrlWithQuery(`/api/${collection}/${id}`, searchParams);

    return this._makeApiRequest<Collection<Slug>>(endpoint, 'GET');
  }

  async create<Slug extends CollectionSlug>(args: CreateArgs<Slug>): Promise<Collection<Slug>> {
    const { collection, data, ...searchParams } = args;
    const endpoint = this._buildUrlWithQuery(`/api/${collection}`, searchParams);

    const result = await this._makeApiRequest<CreateResult<Collection<Slug>>>(
      endpoint,
      'POST',
      data
    );
    return result.doc;
  }

  async createFile<Slug extends FileCollectionSlug>(
    args: CreateFileArgs<Slug>
  ): Promise<Collection<Slug>> {
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
  }

  async updateByID<Slug extends CollectionSlug>(
    args: UpdateByIDArgs<Slug>
  ): Promise<Collection<Slug>> {
    const { collection, data, id, ...searchParams } = args;
    const endpoint = this._buildUrlWithQuery(`/api/${collection}/${id}`, searchParams);

    const result = await this._makeApiRequest<UpdateByIDResult<Collection<Slug>>>(
      endpoint,
      'PATCH',
      data
    );
    return result.doc;
  }

  async getPreference<TValue = unknown>(key: string): Promise<TValue> {
    const endpoint = `/api/payload-preferences/${key}`;
    const result = await this._makeApiRequest<GetPreference<TValue>>(endpoint, 'GET');
    return result.value;
  }

  async updatePreference<TValue = unknown>(key: string, value: TValue): Promise<TValue> {
    const endpoint = `/api/payload-preferences/${key}`;
    const data = { value };
    const result = await this._makeApiRequest<UpdatePreference<TValue>>(endpoint, 'POST', data);
    return result.doc.value;
  }
}
