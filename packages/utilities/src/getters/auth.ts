import { AuthResult } from '@lactalink/types';
import { extractErrorMessage } from '../errors/extractError';

/**
 * Parameters for the `getMeUser` function.
 */
type Params = {
  /**
   * The authentication token to be used in the request.
   */
  token: string;

  /**
   * The base URL of the API or a `URL` object.
   */
  url: string | URL;

  /**
   * The collection to query. Defaults to 'users'.
   */
  collection?: 'users';

  /**
   * The type of token to use in the `Authorization` header. Defaults to 'Bearer'.
   */
  tokenType?: 'JWT' | 'Bearer';
};

/**
 * Fetches the authenticated user's data from the API.
 *
 * @param params - The parameters for the request, including the token, URL, and optional collection and token type.
 * @returns A promise that resolves to an `AuthResult` object containing the user's data or an error message.
 *
 * @example
 * ```typescript
 * const result = await getMeUser({
 *   token: 'your-auth-token',
 *   url: 'https://api.example.com',
 * });
 *
 * if (result.user) {
 *   console.log('User:', result.user);
 * } else {
 *   console.error('Error:', result.message);
 * }
 * ```
 */
export async function getMeUser(params: Params): Promise<AuthResult> {
  const { token, url, collection = 'users', tokenType = 'Bearer' } = params;
  const apiUrl = typeof url === 'string' ? url : url.origin;

  try {
    const res = await fetch(new URL(`/api/${collection}/me`, apiUrl), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${tokenType} ${token}`,
      },
    });

    const data = (await res.json()) as AuthResult;

    if (!res.ok) {
      let msg = data.message || 'An unexpected error occurred.';
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    return { message: extractErrorMessage(error), user: null };
  }
}
