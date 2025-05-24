import type {
  CollectionBySlug,
  CollectionSlug,
  CreateArgs,
  FileCollectionSlug,
  FindArgs,
  FindByIDArgs,
  FindResult,
  UpdateByIDArgs,
} from '@lactalink/types';

export interface IApiClient {
  /**
   * Sets the authentication token for API requests.
   * @param token - The token to set, or `null` to clear the token.
   */
  setToken(token?: string | null): void;

  /**
   * Sets the bypass token for API requests.
   * @param bypassToken - The bypass token to set.
   */
  setBypassToken(bypassToken?: string): void;

  /**
   * Retrieves the current authentication token.
   * @returns The current token, or `null` if no token is set.
   */
  getToken(): string | null | undefined;

  /**
   * Updates the headers used for API requests by merging with the existing headers.
   * @param headers - The headers to merge.
   */
  updateHeaders(headers: Headers): void;

  /**
   * Replaces the headers used for API requests.
   * @param headers - The new headers to set.
   */
  setHeaders(headers: Headers): void;

  /**
   * Retrieves the current headers used for API requests.
   * @returns The current headers.
   */
  getHeaders(): Headers;

  /**
   * Finds documents in a collection.
   *
   * This method performs a query on a specified collection and retrieves documents
   * based on the provided arguments. It supports both paginated and non-paginated results.
   *
   * @template Slug - The slug of the collection being queried.
   * @template IsPaginated - A boolean indicating whether the result is paginated.
   *                          Defaults to `true`.
   * @param args - The arguments for the find operation, including filters, pagination options,
   *               and sorting preferences.
   * @returns A promise resolving to the found documents. The result type depends on the
   *          `IsPaginated` parameter:
   *          - If `IsPaginated` is `true`, the result includes pagination metadata.
   *          - If `IsPaginated` is `false`, the result is a simple array of documents.
   *
   * @example
   * ```typescript
   * // Example 1: Paginated query
   * const result = await apiClient.find({
   *   collection: 'users',
   *   where: { role: { equals: 'admin' } },
   *   limit: 10,
   *   page: 1,
   * });
   * console.log(result.docs); // Array of user documents
   * console.log(result.totalDocs); // Total number of documents
   *
   * // Example 2: Non-paginated query
   * const result = await apiClient.find<'users', false>({
   *   collection: 'users',
   *   where: { role: { equals: 'admin' } },
   *   paginated: false,
   * });
   * console.log(result); // Array of user documents
   * ```
   */
  find<Slug extends CollectionSlug, IsPaginated extends boolean = true>(
    args: FindArgs<Slug, IsPaginated>
  ): Promise<FindResult<Slug, IsPaginated>>;

  /**
   * Finds a document by its ID in a collection.
   * @param args - The arguments for the find-by-ID operation.
   * @returns A promise resolving to the found document.
   */
  findByID<Slug extends CollectionSlug>(args: FindByIDArgs<Slug>): Promise<CollectionBySlug<Slug>>;

  /**
   * Creates a new document in a collection.
   * @param args - The arguments for the create operation.
   * @returns A promise resolving to the created document.
   */
  create<Slug extends CollectionSlug>(args: CreateArgs<Slug>): Promise<CollectionBySlug<Slug>>;

  /**
   * Uploads a file to a collection.
   * @param args - The arguments for the file upload operation.
   * @returns A promise resolving to the uploaded file's metadata.
   */
  createFile<Slug extends FileCollectionSlug>(
    args: CreateArgs<Slug>
  ): Promise<CollectionBySlug<Slug>>;

  /**
   * Updates a document by its ID in a collection.
   * @param args - The arguments for the update-by-ID operation.
   * @returns A promise resolving to the updated document.
   */
  updateByID<Slug extends CollectionSlug>(
    args: UpdateByIDArgs<Slug>
  ): Promise<CollectionBySlug<Slug>>;

  /**
   * Retrieves a user preference by its key.
   * @param key - The key of the preference to retrieve.
   * @returns A promise resolving to the preference value.
   */
  getPreference<TValue = unknown>(key: string): Promise<TValue>;

  /**
   * Updates a user preference by its key.
   * @param key - The key of the preference to update.
   * @param value - The new value for the preference.
   * @returns A promise resolving to the updated preference value.
   */
  updatePreference<TValue = unknown>(key: string, value: TValue): Promise<TValue>;
}
