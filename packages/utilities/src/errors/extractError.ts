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
      return 'Unknown error';
    });
    return errorMessages.join(', ');
  }
  return 'An unexpected error occurred.';
}

export function extractErrorCode<T = unknown>(error: T): string {
  if (error && typeof error === 'object' && 'code' in error)
    return String((error as { code: unknown }).code);
  return 'unknown_error';
}

export function extractErrorStatus<T = unknown>(error: T): number {
  if (error && typeof error === 'object' && 'status' in error)
    return Number((error as { status: unknown }).status);
  return 500;
}

export function extractErrorName<T = unknown>(error: T): string {
  if (error && typeof error === 'object' && 'name' in error)
    return String((error as { name: unknown }).name);
  return 'Unknown Error';
}
