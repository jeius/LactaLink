import { CustomError } from '@lactalink/types';

export function extractErrorMessage<T = unknown>(error: T): string {
  if (error && typeof error === 'object' && 'message' in error)
    return String((error as any).message);
  return 'An unexpected error occurred.';
}

export function extractErrorCode<T = unknown>(error: T): string {
  if (error && typeof error === 'object' && 'code' in error) return String((error as any).code);
  return 'unknown_error';
}

export function extractErrorStatus<T = unknown>(error: T): number {
  if (error && typeof error === 'object' && 'status' in error) return Number((error as any).status);
  return 500;
}

export function extractErrorName<T = unknown>(error: T): string {
  if (error && typeof error === 'object' && 'name' in error) return String((error as any).name);
  return 'Unknown Error';
}

export function isDuplicateError<T extends string | CustomError>(error: T): boolean {
  if (typeof error === 'string') return error.toLowerCase().includes('unique constraint failed');
  if (typeof error === 'object')
    return extractErrorMessage(error).toLowerCase().includes('unique constraint failed');
  return false;
}
