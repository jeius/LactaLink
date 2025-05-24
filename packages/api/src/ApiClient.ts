import {
  BaseApiFetchArgs,
  CollectionSlug,
  CreateArgs,
  FileCollectionSlug,
  FindArgs,
  FindByIDArgs,
  GetPreference,
  IApiClient,
  UpdateByIDArgs,
  UpdatePreference,
} from '@lactalink/types';
import { mergeHeaders } from '@lactalink/utilities';
import { apiFetch } from './apiFetch';
import { createDoc, uploadFile } from './operations/create';
import { findDocById, findDocs } from './operations/find';
import { updateDocByID } from './operations/update';

export class ApiClient implements IApiClient {
  private url: string | URL;
  private token?: string | null;
  private bypassToken?: string;
  private headers: Headers;

  constructor(apiUrl: string | URL, token?: string | null, bypassToken?: string) {
    this.url = apiUrl;
    this.token = token;
    this.bypassToken = bypassToken;
    this.headers = new Headers({
      'Content-Type': 'application/json',
    });
  }

  private _getBaseFetchOptions(): BaseApiFetchArgs {
    return {
      url: this.url,
      token: this.token,
      bypassToken: this.bypassToken,
      headers: this.headers,
    };
  }

  setToken(token?: string | null) {
    this.token = token;
  }

  setBypassToken(bypassToken?: string) {
    this.bypassToken = bypassToken;
  }

  getToken() {
    return this.token;
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

  async find<Slug extends CollectionSlug, IsPaginated extends boolean = true>(
    args: FindArgs<Slug, IsPaginated>
  ) {
    return await findDocs(args, this._getBaseFetchOptions());
  }

  async findByID<T extends CollectionSlug>(args: FindByIDArgs<T>) {
    return await findDocById(args, this._getBaseFetchOptions());
  }

  async create<T extends CollectionSlug>(args: CreateArgs<T>) {
    return await createDoc(args, this._getBaseFetchOptions());
  }

  async createFile<T extends FileCollectionSlug>(args: CreateArgs<T>) {
    return await uploadFile(args, this._getBaseFetchOptions());
  }

  async updateByID<T extends CollectionSlug>(args: UpdateByIDArgs<T>) {
    return await updateDocByID(args, this._getBaseFetchOptions());
  }

  async getPreference<TValue = unknown>(key: string) {
    const { url: apiUrl, ...restOfFetchOptions } = this._getBaseFetchOptions();

    const url = new URL(`/api/payload-preferences/${key}`, apiUrl);

    const res = await apiFetch<GetPreference<TValue>>({
      ...restOfFetchOptions,
      url,
      method: 'GET',
    });

    if ('error' in res) {
      throw Error(res.message);
    }

    return res.data.value;
  }

  async updatePreference<TValue = unknown>(key: string, value: TValue) {
    const { url: apiUrl, ...restOfFetchOptions } = this._getBaseFetchOptions();

    const url = new URL(`/api/payload-preferences/${key}`, apiUrl);

    const res = await apiFetch<UpdatePreference<TValue>>({
      ...restOfFetchOptions,
      url,
      method: 'POST',
      body: { value },
    });

    if ('error' in res) {
      throw Error(res.message);
    }

    return res.data.doc.value;
  }
}
