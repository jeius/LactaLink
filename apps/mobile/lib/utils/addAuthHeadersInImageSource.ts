import { getApiClient } from '@lactalink/api';
import type { ImageProps as ExpoImageProps } from 'expo-image';
import type { ImageProps as RNImageProps } from 'react-native';

export function getApiHeaders(): Record<string, string> {
  const apiClient = getApiClient();
  const entries = apiClient.getHeaders().entries();
  return Array.from(entries).reduce(
    (acc, [key, value]) => {
      if (value && key) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, string>
  );
}

export function addAuthHeadersInImageSource<
  T extends RNImageProps['source'] | ExpoImageProps['source'],
>(source: T): T {
  if (!source) return source as T;

  const headers = getApiHeaders();

  if (typeof source === 'string') return { uri: source, headers } as T;

  if (typeof source === 'number') return source as T;

  if (Array.isArray(source)) {
    return source.map((src) => {
      if (typeof src !== 'object') return { uri: src, headers };
      return { ...src, headers: { ...src.headers, ...headers } };
    }) as T;
  }

  if ('headers' in source) {
    return { ...source, headers: { ...source.headers, ...headers } } as unknown as T;
  }

  return { ...source, headers } as unknown as T;
}
