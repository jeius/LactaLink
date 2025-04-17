export function extractID(value?: Partial<{ id: string }> | string | null) {
  if (!value) return value;

  if (typeof value === 'object') {
    return value.id;
  }

  return value;
}
