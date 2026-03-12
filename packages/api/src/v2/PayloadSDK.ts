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
  BulkOperationResult,
  IDType,
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
} from 'node_modules/@payloadcms/sdk/dist/types';

import { mergeHeaders } from '@lactalink/utilities';
import {
  DraftOption,
  FindManyResult,
  IPayloadSDK,
  TrashOption,
  UpdateDraftOption,
} from './interfaces';
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

    const url = this.baseURL + (queryString ? path.trim() + queryString : path.trim());

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
          error: errorData,
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
    options: Omit<FindOptions<T, TSlug, TSelect>, 'pagination'> & {
      pagination?: TPagination;
    } & DraftOption<T, TSlug>,
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
    options: CreateOptions<T, TSlug, TSelect> & DraftOption<T, TSlug>,
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
    options: UpdateManyOptions<T, TSlug, TSelect> & UpdateDraftOption<T, TSlug>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>[]> => {
    const { autoSave, id: _, ...restOfOptions } = options;
    let docs: TransformCollectionWithSelect<T, TSlug, TSelect>[];
    let errors: { id: IDType<T, TSlug>; message: string }[];

    if (!autoSave) {
      const result = await super.update<TSlug, TSelect>(restOfOptions, init);
      docs = result.docs;
      errors = result.errors;
    } else {
      // We use the apiFetch to manually attach the autoSave query param
      const { collection, data, ...searchParams } = restOfOptions;
      const result = await this.apiFetch<BulkOperationResult<T, TSlug, TSelect>>(`/${collection}`, {
        ...init,
        searchParams,
        method: 'PATCH',
        body: data as Record<string, unknown>,
      });
      docs = result.docs;
      errors = result.errors;
    }

    if (errors && errors.length > 0) {
      throw new Error(`Failed to update some documents`, { cause: errors });
    }

    return docs;
  };

  updateByID = async <
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: UpdateByIDOptions<T, TSlug, TSelect> & UpdateDraftOption<T, TSlug>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>> => {
    const { autoSave, ...restOfOptions } = options;

    if (!autoSave) {
      return super.update<TSlug, TSelect>(restOfOptions, init);
    }

    // We use the apiFetch to manually attach the autoSave query param
    const { collection, id, data, ...searchParams } = restOfOptions;
    return this.apiFetch<TransformCollectionWithSelect<T, TSlug, TSelect>>(`/${collection}/${id}`, {
      ...init,
      searchParams,
      method: 'PATCH',
      body: data as Record<string, unknown>,
    });
  };

  //@ts-expect-error - Overriding the base class method with a more specific return type
  delete = async <
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: DeleteManyOptions<T, TSlug, TSelect> & TrashOption<T, TSlug> & DraftOption<T, TSlug>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>[]> => {
    const { trash, id: _, ...restOfOptions } = options;

    if (trash) {
      // Handle soft-delete by updating the `deletedAt`
      return this.update<TSlug, TSelect>(
        // @ts-expect-error - No payload type support for this yet
        // but we know it will be valid based on the presence of the `trash` option
        { ...restOfOptions, data: { deletedAt: new Date().toISOString() } },
        init
      );
    }

    const { docs, errors } = await super.delete<TSlug, TSelect>(restOfOptions, init);

    if (errors && errors.length > 0) {
      throw new Error(`Failed to delete some documents`, { cause: errors });
    }

    return docs;
  };

  deleteByID = async <
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: DeleteByIDOptions<T, TSlug, TSelect> & TrashOption<T, TSlug> & DraftOption<T, TSlug>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>> => {
    const { trash, ...restOfOptions } = options;

    if (!trash) {
      return super.delete<TSlug, TSelect>(restOfOptions, init);
    }

    // Handle soft-delete by updating the `deletedAt`
    return this.updateByID<TSlug, TSelect>(
      // @ts-expect-error - No payload type support for this yet
      // but we know it will be valid based on the presence of the `trash` option
      { ...restOfOptions, data: { deletedAt: new Date().toISOString() } },
      init
    );
  };

  getPreference = async <TValue = unknown>(key: string) => {
    const endpoint = `/payload-preferences/${key}`;
    const response = await this.request({ path: endpoint, method: 'GET' });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get preference: ${response.statusText}`, {
        cause: {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        },
      });
    }

    const result: GetPreference<TValue> = await response.json();
    return result.value;
  };

  updatePreference = async <TValue = unknown>(key: string, value: TValue) => {
    const endpoint = `/payload-preferences/${key}`;
    const response = await this.request({ path: endpoint, method: 'POST', json: { value } });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update preference: ${response.statusText}`, {
        cause: {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        },
      });
    }

    const result: UpdatePreference<TValue> = await response.json();
    return result?.doc.value;
  };

  //#endregion ----------------------------------------------------------------------
}
