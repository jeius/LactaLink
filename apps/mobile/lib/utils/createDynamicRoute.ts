import type { Href } from 'expo-router';

/**
 * Generates an array of dynamic routes by combining a base path with multiple sub-paths.
 *
 * @param path - The base path for the routes.
 * @param subPaths - An array of sub-paths to append to the base path.
 * @returns An array of complete routes.
 *
 * @example
 * ```ts
 * const routes = createDynamicRoute('/profile/setup', ['type', 'details', 'contact']);
 * // routes will be:
 * // [ '/profile/setup/type', '/profile/setup/details', '/profile/setup/contact' ]
 * ```
 */
export function createDynamicRoute<T extends readonly string[]>(path: Href, subPaths: T) {
  return subPaths.map((subPath) => {
    const segmentedPath = path.toString().trim().split('/');
    const segmentedSubPath = subPath.trim().split('/');
    const routeSegments = [...segmentedPath, ...segmentedSubPath];

    return routeSegments.join('/');
  });
}
