import { AbortError } from './model';

/**
 * Checks if the given error is an AbortError, which indicates that a
 * request was cancelled by the client.
 */
export function isAbortError(error: unknown): boolean {
  return (
    error instanceof AbortError ||
    (error instanceof Error && error.name === 'AbortError') ||
    (typeof error === 'object' && error !== null && 'status' in error && error.status === 499)
  );
}
