import type {
  ApiMethod,
  CountOptions,
  CreateOptions,
  DeleteByID,
  DeleteMany,
  FindMany,
  FindManyResult,
  FindOne,
  FindOneResult,
  UpdateByID,
  UpdateMany,
  UploadFile,
} from '@lactalink/types/api';
import type { CollectionSlug, FileCollectionSlug } from '@lactalink/types/collections';
import type { PaginatedDocs, SelectFromCollectionSlug } from '@lactalink/types/payload-types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IAuthClient } from './AuthClient';

/**
 * Interface defining the contract for API client implementations.
 * Provides methods for CRUD operations, authentication, header management,
 * user preferences, and environment utilities.
 */
export interface IApiClient {
  /**
   * Authentication client for handling user authentication and token management.
   * May be undefined if not properly initialized.
   */
  readonly auth: IAuthClient;

  /**
   * Supabase client instance for database operations.
   * This client is used for direct database interactions.
   * @returns SupabaseClient instance
   */
  getSupabaseClient(): SupabaseClient;

  /**
   * Sets the Supabase client instance.
   *
   * @param supabase - The Supabase client instance or a function that returns it.
   */
  setSupabaseClient(supabase: SupabaseClient | (() => SupabaseClient)): void;

  /**
   * Sets the bypass token for API requests.
   * This token can be used to bypass normal authentication mechanisms
   * of api requests, useful for automation or testing purposes.
   * @param bypassToken - Optional token to bypass normal authentication
   *
   * @example
   * apiClient.setBypassToken(process.env.VERCEL_AUTOMATION_BYPASS_TOKEN);
   */
  setBypassToken(bypassToken?: string): void;

  /**
   * Updates the current headers by merging new headers with existing ones.
   * Existing headers with the same key will be overwritten.
   * @param headers - Headers to merge with existing headers
   */
  updateHeaders(headers: Headers): void;

  /**
   * Replaces all current headers with the provided headers.
   * This will completely override the existing headers.
   * @param headers - New headers to set
   */
  setHeaders(headers: Headers): void;

  /**
   * Retrieves the current headers.
   * @returns The current Headers object
   */
  getHeaders(): Headers;

  /**
   * Gets the current application environment.
   * @returns The application environment string (e.g., 'expo', 'nextjs', 'node')
   */
  getAppEnvironment(): string;

  /**
   * Checks if the current environment is an Expo app.
   * @returns True if running in Expo environment, false otherwise
   */
  isExpoApp(): boolean;

  /**
   * Checks if the current environment is a Next.js app.
   * @returns True if running in Next.js environment, false otherwise
   */
  isNextJsApp(): boolean;

  /**
   * Fetches data from a specified API endpoint.
   * Supports GET and POST methods, with optional body and headers.
   * Automatically handles bypass token if set.
   *
   * @param endpoint - The API endpoint to fetch data from
   * @param options - Optional parameters for the fetch request
   *   - method: HTTP method (GET, POST, etc.)
   *   - body: Request body for POST/PUT requests
   *   - headers: Additional headers to include in the request
   * @returns Promise resolving to the response data of type TResponse
   *
   */
  fetch<TResponse>(
    endpoint: string,
    options?: {
      method: ApiMethod;
      body?: Record<string, unknown> | object;
      headers?: Headers;
      searchParams?: Record<string, unknown>;
    }
  ): Promise<TResponse>;

  /**
   * Finds documents in a collection with optional pagination and filtering.
   * @template TSlug - The collection slug type
   * @template TPaginate - Whether the results should be paginated
   * @param args - Arguments for the find operation including collection, query params, filters, etc.
   * @returns Promise resolving to the found documents (paginated or not based on IsPaginated)
   */
  find<
    TSlug extends CollectionSlug = CollectionSlug,
    TPaginate extends boolean = boolean,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: FindMany<TSlug, TSelect, TPaginate>
  ): Promise<FindManyResult<TSlug, TSelect, TPaginate>>;

  /**
   * Finds a single document by its ID in the specified collection.
   * @template TSlug - The collection slug type
   * @param args - Arguments containing the collection slug and document ID
   * @returns Promise resolving to the found document
   * @throws Error if document is not found or access is denied
   */
  findByID<
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: FindOne<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>>;

  /**
   * Creates a new document in the specified collection.
   * @template TSlug - The collection slug type
   * @param args - Arguments containing the collection slug and document data
   * @returns Promise resolving to the created document
   * @throws Error if creation fails or validation errors occur
   */
  create<
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: CreateOptions<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>>;

  /**
   * Counts the number of documents in a collection matching the specified criteria.
   * @param args - Arguments for the count operation including collection, filters, etc.
   * @returns Promise resolving to an object containing the total document count
   */
  count(args: CountOptions): Promise<Pick<PaginatedDocs, 'totalDocs'>>;

  /**
   * Creates a new file document in the specified file collection.
   * Handles file upload and document creation in one operation.
   * @template TSlug - The file collection slug type
   * @param args - Arguments containing the collection slug and file data
   * @returns Promise resolving to the created file document
   * @throws Error if file upload or creation fails
   */
  uploadFile<
    TSlug extends FileCollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: UploadFile<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>>;

  /**
   * Updates multiple documents in a collection with the provided data.
   * This method allows bulk updates based on a filter query.
   * @template Slug - The collection slug type
   * @param args - Arguments containing the collection slug, document ID, and update data
   * @returns Promise resolving to the updated document
   * @throws Error if document is not found, access is denied, or validation fails
   */
  update<
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: UpdateMany<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>[]>;

  /**
   * Updates an existing document by its ID in the specified collection.
   * @template Slug - The collection slug type
   * @param args - Arguments containing the collection slug, document ID, and update data
   * @returns Promise resolving to the updated document
   * @throws Error if document is not found, access is denied, or validation fails
   */
  updateByID<
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: UpdateByID<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>>;

  /**
   * Deletes multiple documents in a collection based on a filter query.
   * This method allows bulk deletion of documents matching the specified criteria.
   * @template Slug - The collection slug type
   * @template IsPaginated - Whether the results should be paginated
   * @param args - Arguments for the delete operation including collection, query params, filters, etc.
   * @returns Promise resolving to the found documents (paginated or not based on IsPaginated)
   */
  delete<
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: DeleteMany<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>[]>;

  /**
   * Deletes a single document by its ID in the specified collection.
   * @template Slug - The collection slug type
   * @param args - Arguments containing the collection slug and document ID
   * @returns Promise resolving to the deleted document
   * @throws Error if document is not found or access is denied
   */
  deleteByID<
    TSlug extends CollectionSlug = CollectionSlug,
    TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  >(
    args: DeleteByID<TSlug, TSelect>
  ): Promise<FindOneResult<TSlug, TSelect>>;

  /**
   * Retrieves a user preference value by its key.
   * @template TValue - The expected type of the preference value
   * @param key - The preference key to retrieve
   * @returns Promise resolving to the preference value
   * @throws Error if the preference cannot be retrieved or doesn't exist
   */
  getPreference<TValue = unknown>(key: string): Promise<TValue>;

  /**
   * Updates a user preference with a new value.
   * Creates the preference if it doesn't exist, updates if it does.
   * @template TValue - The type of the preference value
   * @param key - The preference key to update
   * @param value - The new value to set for the preference
   * @returns Promise resolving to the updated preference value
   * @throws Error if the preference cannot be updated
   */
  updatePreference<TValue = unknown>(key: string, value: TValue): Promise<TValue>;
}
