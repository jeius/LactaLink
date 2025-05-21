import type { Href } from 'expo-router';

export function createDynamicRoute<T extends readonly string[]>(path: Href, subPaths: T) {
  return subPaths.map((subPath) => {
    const segmentedPath = path.toString().trim().split('/');
    const segmentedSubPath = subPath.trim().split('/');
    const routeSegments = [...segmentedPath, ...segmentedSubPath];

    return routeSegments.join('/');
  });
}
