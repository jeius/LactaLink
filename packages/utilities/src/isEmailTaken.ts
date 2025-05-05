import { stringify } from 'qs-esm';

type Params = {
  /**
   * The base URL of the API.
   */
  apiUrl: string;

  /**
   * The email address to check for existence.
   */
  email: string;
};

/**
 * Checks if an email address is already taken in the system.
 *
 * This function sends a GET request to the API to check if a user with the specified email address exists.
 * It constructs a query using the `qs-esm` library to filter users by the provided email.
 *
 * @param params - An object containing the API URL and the email address to check.
 * @returns A promise that resolves to:
 * - `true` if the email is already taken,
 * - `false` if the email is available,
 * - A string error message if the request fails.
 *
 * @example
 * ```typescript
 * const isTaken = await isEmailTaken({
 *   apiUrl: 'https://api.example.com',
 *   email: 'test@example.com',
 * });
 *
 * if (isTaken === true) {
 *   console.log('Email is already taken.');
 * } else if (isTaken === false) {
 *   console.log('Email is available.');
 * } else {
 *   console.error('Error:', isTaken);
 * }
 * ```
 */
export async function isEmailTaken(params: Params): Promise<boolean | string> {
  const { apiUrl: url, email } = params;
  const where = { email: { equals: email } };
  const query = stringify({ where });

  const apiUrl = `${url}/api/users?${query}`;

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const { errors } = (await res.json()) as { errors: { message: string }[] };
      return errors[0].message;
    }

    const { totalDocs } = (await res.json()) as { totalDocs: number };

    return totalDocs > 0;
  } catch (error) {
    return `An error occurred: ${(error as Error).message}`;
  }
}
