// Nitro callback wrappers are only needed by native map views.
export function wrapCallback<T extends (...args: never[]) => unknown>(
  propCallback?: T,
  fallback?: T
) {
  return (...args: Parameters<T>) => {
    propCallback?.(...args);
    fallback?.(...args);
  };
}
