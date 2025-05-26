import { AuthError, isAuthApiError, isAuthError } from '@supabase/supabase-js';

/**
 * Extracts the error message from an error object or array of errors.
 *
 * This utility function handles various error formats, including objects with a `message` property,
 * arrays of such objects, or plain strings. If the error format is unrecognized, it returns a default
 * error message.
 *
 * @template T - The type of the error input.
 * @param error - The error object, array of errors, or unknown input.
 * @returns A string containing the extracted error message(s) or a default message if none is found.
 *
 * @example
 * ```typescript
 * const error = { message: 'Something went wrong' };
 * const message = extractErrorMessage(error); // 'Something went wrong'
 *
 * const errors = [{ message: 'Error 1' }, { message: 'Error 2' }];
 * const message = extractErrorMessage(errors); // 'Error 1, Error 2'
 *
 * const unknownError = 123;
 * const message = extractErrorMessage(unknownError); // 'An unexpected error occurred.'
 * ```
 */
export function extractErrorMessage<T = unknown>(error: T): string {
  if (error && typeof error === 'object' && 'message' in error)
    return String((error as { message: unknown }).message);
  else if (Array.isArray(error)) {
    const errorMessages = error.map((err) => {
      if (typeof err === 'object' && 'message' in err) {
        return String((err as { message: unknown }).message);
      } else if (typeof err === 'string') {
        return err;
      }
      return 'Unknown error.';
    });
    return errorMessages.join(', ');
  }
  return 'Unknown error.';
}

/**
 * Extracts the error code from an error object.
 *
 * This utility function retrieves the `code` property from an error object. If the `code` property
 * is not present or the input is not an object, it returns a default value of `'unknown_error'`.
 *
 * @template T - The type of the error input.
 * @param error - The error object or unknown input.
 * @returns A string containing the extracted error code or `'unknown_error'` if none is found.
 *
 * @example
 * ```typescript
 * const error = { code: 'ERR_INVALID' };
 * const code = extractErrorCode(error); // 'ERR_INVALID'
 *
 * const unknownError = {};
 * const code = extractErrorCode(unknownError); // 'unknown_error'
 * ```
 */
export function extractAuthErrorCode<T = unknown>(error: T): AuthError['code'] {
  if (isAuthError(error)) {
    return error.code || 'unknown_error';
  }

  if (isAuthApiError(error)) {
    return error.code || 'unknown_error';
  }

  // if (error && typeof error === 'object' && 'code' in error) {
  //   return String((error as { code: unknown }).code);
  // }

  return 'unknown_error';
}

/**
 * Extracts the HTTP status code from an error object.
 *
 * This utility function retrieves the `status` property from an error object. If the `status` property
 * is not present or the input is not an object, it returns a default value of `500`.
 *
 * @template T - The type of the error input.
 * @param error - The error object or unknown input.
 * @returns A number representing the extracted HTTP status code or `500` if none is found.
 *
 * @example
 * ```typescript
 * const error = { status: 404 };
 * const status = extractErrorStatus(error); // 404
 *
 * const unknownError = {};
 * const status = extractErrorStatus(unknownError); // 500
 * ```
 */
export function extractErrorStatus<T = unknown>(error: T): number {
  if (error && typeof error === 'object' && 'status' in error)
    return Number((error as { status: unknown }).status);
  return 500;
}

/**
 * Extracts the error name from an error object.
 *
 * This utility function retrieves the `name` property from an error object. If the `name` property
 * is not present or the input is not an object, it returns a default value of `'Unknown Error'`.
 *
 * @template T - The type of the error input.
 * @param error - The error object or unknown input.
 * @returns A string containing the extracted error name or `'Unknown Error'` if none is found.
 *
 * @example
 * ```typescript
 * const error = { name: 'ValidationError' };
 * const name = extractErrorName(error); // 'ValidationError'
 *
 * const unknownError = {};
 * const name = extractErrorName(unknownError); // 'Unknown Error'
 * ```
 */
export function extractErrorName<T = unknown>(error: T): string {
  if (error && typeof error === 'object' && 'name' in error)
    return String((error as { name: unknown }).name);
  return 'Unknown Error';
}
