import { APIError } from 'payload';
import { createAbortError } from './createError';

/**
 * A wrapper function that handles request cancellations.
 *
 * @param callback - The asynchronous function to execute, which can be aborted via the provided signal.
 * @param options.signal - An AbortSignal that can be used to handle request cancellation.
 * @returns A Promise that resolves to the result of the callback function, or rejects with an APIError
 * if the request is cancelled.
 *
 * @throws An `APIError` with status code 499 indicating the request was cancelled.
 */
export function abortableAPIHandler<T>(
  callback: () => Promise<T>,
  { signal }: { signal: AbortSignal }
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (signal.aborted) {
      return reject(createAbortError());
    }

    signal.addEventListener(
      'abort',
      () => {
        if (signal.reason instanceof APIError) reject(signal.reason);
        else reject(createAbortError());
      },
      { once: true }
    );

    return callback().then(resolve, reject);
  });
}
