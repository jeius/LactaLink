import { getApiClient } from '@lactalink/api';
import type { ImageProps as ExpoImageProps } from 'expo-image';
import type { ImageProps as RNImageProps } from 'react-native';

export function getApiHeaders(): Record<string, string> {
  const apiClient = getApiClient();
  const headers: Record<string, string> = {};
  const entries = apiClient.getHeaders().entries();
  for (const [key, value] of entries) {
    if (value && key) {
      headers[key] = value;
    }
  }

  return headers;
}

export function appendHeaders(
  props: RNImageProps | ExpoImageProps
): RNImageProps['source'] | ExpoImageProps['source'] {
  if (!props.source) return props.source;

  const headers = getApiHeaders();

  let transformedSource;
  if (typeof props.source === 'string') {
    transformedSource = { uri: props.source, headers };
  } else if (typeof props.source === 'object') {
    if (Array.isArray(props.source)) {
      transformedSource = props.source.map((source) => {
        if (typeof source === 'object') {
          return { ...source, headers: { ...source.headers, ...headers } };
        }
        return {};
      });
    } else if ('headers' in props.source) {
      transformedSource = { ...props.source, headers: { ...props.source.headers, ...headers } };
    } else {
      transformedSource = { ...props.source, headers };
    }
  } else {
    transformedSource = props.source;
  }
  return transformedSource;
}
