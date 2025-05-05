import { extractErrorMessage } from '../errors/extractError';
import { BaseParams, Result } from './types';

/**
 * Represents the response from a successful POST request to create or update a preference.
 *
 * @template T - The type of the preference value.
 */
type PostPreference<T = unknown> = {
  message: string;
  doc: {
    user: string;
    key: string;
    userCollection: string;
    value: T;
  };
};

/**
 * Creates or updates a user preference in the API.
 *
 * @template T - The type of the preference value.
 * @param params - The parameters for the request, including the authentication token, API URL, preference key, and value.
 * @returns A promise that resolves to a `Result` containing the response data or an error message.
 *
 * @example
 * ```typescript
 * const result = await postPreference({
 *   authToken: 'your-auth-token',
 *   apiUrl: 'https://api.example.com',
 *   key: 'theme',
 *   value: 'dark',
 * });
 *
 * if ('data' in result) {
 *   console.log('Preference updated:', result.data);
 * } else {
 *   console.error('Error:', result.message);
 * }
 * ```
 */
export async function postPreference<T = unknown>(
  params: BaseParams<T>
): Promise<Result<PostPreference<T>>> {
  const { authToken, apiUrl: url, key, value } = params;
  const apiUrl = `${url}/api/payload-preferences/${key}`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${authToken}`,
      },
      body: JSON.stringify({ value }),
    });

    const data = await res.json();

    if (!res.ok) {
      let msg = 'An unexpected error occurred.';
      if (data && typeof data === 'object' && 'message' in data) {
        msg = data.message as string;
      }
      throw new Error(msg);
    }

    return { data: data as PostPreference<T> };
  } catch (err) {
    return { message: extractErrorMessage(err), error: err as Error };
  }
}
