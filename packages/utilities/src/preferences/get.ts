import { extractErrorMessage } from '../errors/extractError';
import { BaseParams, Result } from './types';

/**
 * Represents a preference object retrieved from the API.
 *
 * @template T - The type of the preference value.
 */
type GetPreference<T> = {
  _id: string;
  key: string;
  user: string;
  userCollection: string;
  __v: number;
  value: T;
};

/**
 * Fetches a user preference from the API.
 *
 * @template TValue - The type of the preference value.
 * @param params - The parameters for the request, including the authentication token, API URL, and preference key.
 * @returns A promise that resolves to a `Result` containing the preference data or an error message.
 *
 * @example
 * ```typescript
 * const result = await getPreference({
 *   authToken: 'your-auth-token',
 *   apiUrl: 'https://api.example.com',
 *   key: 'theme',
 * });
 *
 * if ('data' in result) {
 *   console.log('Preference:', result.data);
 * } else {
 *   console.error('Error:', result.message);
 * }
 * ```
 */
export async function getPreference<TValue = unknown>(
  params: Omit<BaseParams, 'value'>
): Promise<Result<GetPreference<TValue>>> {
  const { authToken, apiUrl: url, key } = params;
  const apiUrl = `${url}/api/payload-preferences/${key}`;

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      let msg = 'An unexpected error occurred.';
      if (data && typeof data === 'object' && 'message' in data) {
        msg = data.message as string;
      }
      throw new Error(msg);
    }

    return { data: data as GetPreference<TValue> };
  } catch (err) {
    return { message: extractErrorMessage(err), error: err as Error };
  }
}
