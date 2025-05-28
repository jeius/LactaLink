import { redirect } from 'next/navigation';
import { SEARCH_PARAMS_KEYS } from '../constants/routes';
import { getServerSideURL } from './getURL';

/**
 * Redirects to a specified path with optional encoded query parameters.
 *
 * This utility function constructs a URL with the provided path, appends an optional message
 * and additional search parameters, and triggers a server-side redirect using Next.js's `redirect` function.
 *
 * @param path - The base path to redirect to. This should be a relative or absolute path.
 * @param message - An optional message to encode and include as a query parameter.
 *                  The key for this parameter is defined in `SEARCH_PARAMS_KEYS.MESSAGE`.
 * @param searchParams - An optional object containing additional query parameters to append to the URL.
 *                       Each key-value pair in the object will be added as a query parameter.
 *
 * @returns This function does not return a value as it triggers a redirect.
 *
 * @example
 * ```typescript
 * // Redirect to '/dashboard' with a success message
 * encodedRedirect('/dashboard', 'Operation successful');
 *
 * // Redirect to '/login' with an error message and additional query parameters
 * encodedRedirect('/login', 'Invalid credentials', { redirectTo: '/dashboard' });
 * ```
 */
export function encodedRedirect(
  path: string,
  message?: string,
  searchParams?: Record<string, string>
) {
  const url = new URL(path, getServerSideURL());

  if (message) {
    url.searchParams.set(SEARCH_PARAMS_KEYS.MESSAGE, message);
  }

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  return redirect(`${url.pathname}${url.search}`);
}
