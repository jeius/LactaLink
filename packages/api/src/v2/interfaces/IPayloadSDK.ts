import { CollectionSlug, PaginatedDocs, SelectType, UploadCollectionSlug } from 'payload';

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

import { PayloadSDK as Payload } from '@payloadcms/sdk';
import type { Config } from '../payload-types';

export type FindManyResult<
  T extends Config = Config,
  TSlug extends CollectionSlug<T> = CollectionSlug<T>,
  TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  TPagination extends boolean = true,
> = TPagination extends true
  ? PaginatedDocs<TransformCollectionWithSelect<T, TSlug, TSelect>>
  : TransformCollectionWithSelect<T, TSlug, TSelect>[];

export interface IPayloadSDK<T extends Config = Config> extends Omit<
  Payload<T>,
  'find' | 'update' | 'delete'
> {
  setBypassToken(token: string): void;

  getBypassToken(): string | undefined;

  updateHeaders(headers: Headers): void;

  setHeaders(headers: Headers): void;

  setAuthHeaders(token: string): void;

  getHeaders(): Headers;

  apiFetch<TData>(
    path: string,
    init?: Omit<RequestInit, 'body'> & {
      searchParams?: Record<string, unknown>;
      body?: Record<string, unknown>;
    }
  ): Promise<TData>;

  find<
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
    TPagination extends boolean = true,
  >(
    options: Omit<FindOptions<T, TSlug, TSelect>, 'pagination'> & { pagination?: TPagination },
    init?: RequestInit
  ): Promise<FindManyResult<T, TSlug, TSelect, TPagination>>;

  uploadFile<
    TSlug extends UploadCollectionSlug<T> = UploadCollectionSlug<T>,
    TSelect extends SelectType = SelectType,
  >(
    options: CreateOptions<T, TSlug, TSelect>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>>;

  update<
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: UpdateManyOptions<T, TSlug, TSelect>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>[]>;

  updateByID<
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: UpdateByIDOptions<T, TSlug, TSelect>
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>>;

  delete<
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: DeleteManyOptions<T, TSlug, TSelect>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>[]>;

  deleteByID<
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: DeleteByIDOptions<T, TSlug, TSelect>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>>;

  getPreference<TValue = unknown>(key: string): Promise<TValue>;

  updatePreference<TValue = unknown>(key: string, value: TValue): Promise<TValue>;
}
