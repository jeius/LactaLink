/**
 * Base parameters for preference-related API requests.
 *
 * @template T - The type of the value being sent or received.
 */
export type BaseParams<T = unknown> = {
  /**
   * The authentication token to be used in the request.
   */
  authToken: string;

  /**
   * The key identifying the preference.
   */
  key: string;

  /**
   * The base URL of the API.
   */
  apiUrl: string;

  /**
   * The value to be sent in the request (optional).
   */
  value?: T;
};

/**
 * Represents a successful API response.
 *
 * @template T - The type of the data in the response.
 */
export type Success<T> = { data: T };

/**
 * Represents a failed API response.
 */
export type Failure = { error: Error; message: string };

/**
 * Represents the result of an API request, which can either be a success or a failure.
 *
 * @template T - The type of the data in the success response.
 */
export type Result<T> = Success<T> | Failure;
