import { callback } from 'react-native-nitro-modules';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function wrapCallback<T extends (...args: any[]) => void>(
  propCallback: T | undefined,
  fallback?: (...args: Parameters<T>) => void
) {
  return callback({
    f: ((...args: Parameters<T>) => {
      propCallback?.(...args);
      fallback?.(...args);
    }) as T,
  });
}
