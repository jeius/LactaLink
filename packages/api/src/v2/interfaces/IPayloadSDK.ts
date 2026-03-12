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

import { Collection } from '@lactalink/types/collections';
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

export type TrashOption<
  T extends Config = Config,
  TSlug extends CollectionSlug<T> = CollectionSlug<T>,
> =
  Collection<TSlug> extends { deletedAt?: string | null } ? { trash?: boolean } : { trash?: never };

export type DraftOption<
  T extends Config = Config,
  TSlug extends CollectionSlug<T> = CollectionSlug<T>,
> = Collection<TSlug> extends { _status?: string | null } ? { draft?: boolean } : { draft?: never };

export type UpdateDraftOption<
  T extends Config = Config,
  TSlug extends CollectionSlug<T> = CollectionSlug<T>,
> =
  Collection<TSlug> extends { _status?: string | null }
    ? { autoSave?: boolean; draft?: boolean }
    : { autoSave?: never; draft?: never };

export interface IPayloadSDK<T extends Config = Config> extends Omit<
  Payload<T>,
  'find' | 'update' | 'delete'
> {
  /**
   * Updates the headers that will be included in subsequent API requests. This method
   * merges the provided headers with any existing headers, allowing for incremental updates.
   *
   * @param headers - The headers to merge with the existing headers.
   */
  updateHeaders(headers: Headers): void;

  /**
   * Replaces the headers that will be included in subsequent API requests with the
   * provided headers.
   *
   * @param headers - The new set of headers to use for API requests.
   */
  setHeaders(headers: Headers): void;

  /**
   * Sets the Authorization header with a Bearer token for authentication.
   * If a null or undefined token is provided, the Authorization header will be removed.
   *
   * @param token - The authentication token to set in the Authorization header.
   */
  setAuthHeaders(token: string): void;

  /**
   * Retrieves the current set of headers that will be included in API requests.
   *
   * @returns The current Headers object containing all headers that will be sent with API requests.
   */
  getHeaders(): Headers;

  /**
   * Retrieves a stored preference value for the given key. This method abstracts the underlying
   * mechanism for storing and retrieving preferences, which may involve API calls or local storage.
   *
   * @param key - The key identifying the preference to retrieve.
   * @returns A promise that resolves to the value of the preference associated with the given key.
   */
  getPreference<TValue = unknown>(key: string): Promise<TValue>;

  /**
   * Updates a preference value for the given key. This method abstracts the underlying mechanism
   * for storing preferences, which may involve API calls or local storage.
   *
   * @param key - The key identifying the preference to update.
   * @param value - The new value to set for the preference.
   * @returns A promise that resolves to the updated value of the preference after it has been stored.
   */
  updatePreference<TValue = unknown>(key: string, value: TValue): Promise<TValue>;

  /**
   * A fetch method for making API requests to the Payload custom endpoints that returns a
   * `ApiFetchResponse` object.
   *
   * @template TData - The expected shape of the data returned in the response.
   * @param path - The API endpoint path (relative to the baseURL) to which the request should be made.
   * @param init - Optional fetch initialization options, with additional `searchParams` property.
   *
   * @throws An `Error` if the fetch operation fails or if the response status indicates an error.
   * @returns A promise that resolves to the parsed JSON response from the `ApiFetchResponse`, typed as `TData`.
   */
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
    options: Omit<FindOptions<T, TSlug, TSelect>, 'pagination'> & {
      pagination?: TPagination;
    } & DraftOption<T, TSlug>,
    init?: RequestInit
  ): Promise<FindManyResult<T, TSlug, TSelect, TPagination>>;

  uploadFile<
    TSlug extends UploadCollectionSlug<T> = UploadCollectionSlug<T>,
    TSelect extends SelectType = SelectType,
  >(
    options: CreateOptions<T, TSlug, TSelect> & DraftOption<T, TSlug>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>>;

  update<
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: UpdateManyOptions<T, TSlug, TSelect> & UpdateDraftOption<T, TSlug>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>[]>;

  updateByID<
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: UpdateByIDOptions<T, TSlug, TSelect> & UpdateDraftOption<T, TSlug>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>>;

  delete<
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug>,
  >(
    options: DeleteManyOptions<T, TSlug, TSelect> & TrashOption<T, TSlug> & DraftOption<T, TSlug>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>[]>;

  deleteByID<
    TSlug extends CollectionSlug<T> = CollectionSlug<T>,
    TSelect extends SelectFromCollectionSlug<T, TSlug> = SelectFromCollectionSlug<T, TSlug> &
      DraftOption<T, TSlug>,
  >(
    options: DeleteByIDOptions<T, TSlug, TSelect> & TrashOption<T, TSlug>,
    init?: RequestInit
  ): Promise<TransformCollectionWithSelect<T, TSlug, TSelect>>;
}
