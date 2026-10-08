function errorMessages(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(errorMessages);
  if (!value || typeof value !== 'object') return [];

  const error = value as Record<string, unknown>;
  // Payload validation errors nest field messages under data.errors.
  const details = errorMessages(error.data).concat(errorMessages(error.errors));
  if (details.length) return details;
  return typeof error.message === 'string' && error.message.trim() ? [error.message] : [];
}

export function getProfileSetupErrorMessage(error: unknown): string {
  const status =
    error && typeof error === 'object' && 'status' in error ? error.status : undefined;

  if (status === 401) return 'Your session has expired. Please sign in again and retry.';
  if (status === 403) return 'Your account does not have permission to create this profile.';
  if (typeof status === 'number' && status >= 500) {
    return `The server could not create your profile (error ${status}). Your form is saved. Please try again later.`;
  }

  const messages = errorMessages(error);
  if (messages.length) return [...new Set(messages)].join('\n');
  if (typeof error === 'string' && error.trim()) return error;
  return 'Could not create your profile. Your form is saved. Please try again.';
}
