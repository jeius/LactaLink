export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error)
    return String((error as any).message);
  return 'An unexpected error occurred.';
}
