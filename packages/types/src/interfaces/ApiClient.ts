import {
  Collection,
  CollectionSlug,
  CreateArgs,
  CreateFileArgs,
  FileCollectionSlug,
  FindArgs,
  FindByIDArgs,
  FindResult,
  UpdateByIDArgs,
} from '@lactalink/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { IAuthClient } from './AuthClient';

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
   * Finds documents in a collection with optional pagination and filtering.
   * @template Slug - The collection slug type
   * @template IsPaginated - Whether the results should be paginated
   * @param args - Arguments for the find operation including collection, query params, filters, etc.
   * @returns Promise resolving to the found documents (paginated or not based on IsPaginated)
   */
  find<Slug extends CollectionSlug, IsPaginated extends boolean = true>(
    args: FindArgs<Slug, IsPaginated>
  ): Promise<FindResult<Slug, IsPaginated>>;

  /**
   * Finds a single document by its ID in the specified collection.
   * @template Slug - The collection slug type
   * @param args - Arguments containing the collection slug and document ID
   * @returns Promise resolving to the found document
   * @throws Error if document is not found or access is denied
   */
  findByID<Slug extends CollectionSlug>(args: FindByIDArgs<Slug>): Promise<Collection<Slug>>;

  /**
   * Creates a new document in the specified collection.
   * @template Slug - The collection slug type
   * @param args - Arguments containing the collection slug and document data
   * @returns Promise resolving to the created document
   * @throws Error if creation fails or validation errors occur
   */
  create<Slug extends CollectionSlug>(args: CreateArgs<Slug>): Promise<Collection<Slug>>;

  /**
   * Creates a new file document in the specified file collection.
   * Handles file upload and document creation in one operation.
   * @template Slug - The file collection slug type
   * @param args - Arguments containing the collection slug and file data
   * @returns Promise resolving to the created file document
   * @throws Error if file upload or creation fails
   */
  createFile<Slug extends FileCollectionSlug>(
    args: CreateFileArgs<Slug>
  ): Promise<Collection<Slug>>;

  /**
   * Updates an existing document by its ID in the specified collection.
   * @template Slug - The collection slug type
   * @param args - Arguments containing the collection slug, document ID, and update data
   * @returns Promise resolving to the updated document
   * @throws Error if document is not found, access is denied, or validation fails
   */
  updateByID<Slug extends CollectionSlug>(args: UpdateByIDArgs<Slug>): Promise<Collection<Slug>>;

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
