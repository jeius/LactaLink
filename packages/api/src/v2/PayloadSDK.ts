import { PayloadSDK as Payload } from '@payloadcms/sdk';

import type { GetPreference, UpdatePreference } from '@lactalink/types';
import type { ApiFetchResponse } from '@lactalink/types/api';
import { CollectionSlug, SelectType, UploadCollectionSlug } from 'payload';
import { stringify } from 'qs-esm';

import type { CreateOptions } from 'node_modules/@payloadcms/sdk/dist/collections/create';
import type {
  DeleteByIDOptions,
  DeleteManyOptions,
} from 'node_modules/@payloadcms/sdk/dist/collections/delete';
import type { FindOptions } from 'node_modules/@payloadcms/sdk/dist/collections/find';
import type {
  UpdateByIDOptions,
  UpdateManyOptions,
} from 'node_modules/@payloadcms/sdk/dist/collections/update';
import type {
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
} from 'node_modules/@payloadcms/sdk/dist/types';

import { mergeHeaders } from '@lactalink/utilities';
import { FindManyResult, IPayloadSDK } from './interfaces';
import { Config } from './payload-types';

export class PayloadSDK<T extends Config = Config> extends Payload<T> implements IPayloadSDK<T> {
  private bypassToken?: string;
  private headers: Headers = new Headers();

  //#region Utility Methods -----------------------------------------------
  setBypassToken = (bypassToken?: string) => {
    this.bypassToken = bypassToken;
  };

  getBypassToken = () => {
    return this.bypassToken;
  };

  updateHeaders = (headers: Headers) => {
    this.headers = mergeHeaders(this.headers, headers);
  };

  setHeaders = (headers: Headers) => {
    this.headers = headers;
  };

  setAuthHeaders = (token: string | null) => {
    if (!token) {
      this.headers.delete('Authorization');
    }
    this.headers.set('Authorization', `Bearer ${token}`);
  };

  getHeaders = () => {
    return this.headers;
  };

  //#endregion --------------------------------------------------------------

  apiFetch = async <TData>(
    path: string,
    init?: Omit<RequestInit, 'body'> & {
      searchParams?: Record<string, unknown>;
      body?: Record<string, unknown>;
    }
  ): Promise<TData> => {
    const { searchParams, body, ...restOptions } = init || {};

    const queryString = searchParams && stringify(searchParams, { addQueryPrefix: true });

    const url = new URL(queryString ? path.trim() + queryString : path, this.baseURL);

    const response = await this.fetch(url, {
      ...restOptions,
      body: body && JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${response.statusText}`, {
        cause: {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        },
      });
    }

    const result: ApiFetchResponse<TData> = await response.json();

    if ('error' in result) {
      throw new Error(result.message, { cause: result.error });
    }

    return result.data;
  };

  //#region API Operations -------------------------------------------------------

  //@ts-expect-error - Overriding the base class method with a more specific return type
  find = async <
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
    TPagination extends boolean = true,
  >(
    options: Omit<FindOptions<T, TSlug, TSelect>, 'pagination'> & { pagination?: TPagination },
    init?: RequestInit
  ): Promise<FindManyResult<T, TSlug, TSelect, TPagination>> => {
    const result = await super.find(options, init);
    const pagination = options.pagination === undefined ? true : options.pagination;
    return (pagination ? result : result.docs) as FindManyResult<T, TSlug, TSelect, TPagination>;
  };

  uploadFile = async <
    TSlug extends UploadCollectionSlug<T> = UploadCollectionSlug<T>,
    TSelect extends SelectType = SelectType,
  >(
    options: CreateOptions<T, TSlug, TSelect>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>> => {
    const result = await super.create(options, init);
    return result;
  };

  //@ts-expect-error - Overriding the base class method with a more specific return type
  update = async <
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: UpdateManyOptions<T, TSlug, TSelect>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>[]> => {
    const { docs, errors } = await super.update(options, init);

    if (errors && errors.length > 0) {
      throw new Error(`Failed to update some documents`, { cause: errors });
    }

    return docs;
  };

  updateByID = async <
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: UpdateByIDOptions<T, TSlug, TSelect>
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>> => {
    return super.update(options);
  };

  //@ts-expect-error - Overriding the base class method with a more specific return type
  delete = async <
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: DeleteManyOptions<T, TSlug, TSelect>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>[]> => {
    const { docs, errors } = await super.delete(options, init);

    if (errors && errors.length > 0) {
      throw new Error(`Failed to delete some documents`, { cause: errors });
    }

    return docs;
  };

  deleteByID = async <
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: DeleteByIDOptions<T, TSlug, TSelect>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>> => {
    return super.delete<TSlug, TSelect>(options, init);
  };

  getPreference = async <TValue = unknown>(key: string) => {
    const endpoint = `/payload-preferences/${key}`;
    const result = await this.apiFetch<GetPreference<TValue>>(endpoint, {
      method: 'GET',
    });
    return result.value;
  };

  updatePreference = async <TValue = unknown>(key: string, value: TValue) => {
    const endpoint = `/payload-preferences/${key}`;
    const result = await this.apiFetch<UpdatePreference<TValue>>(endpoint, {
      method: 'POST',
      body: { value },
    });
    return result.doc.value;
  };

  //#endregion ----------------------------------------------------------------------
}
