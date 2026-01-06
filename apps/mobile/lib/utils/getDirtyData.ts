import type { FieldNamesMarkedBoolean, FieldValues } from 'react-hook-form';

export function getDirtyData<T extends FieldValues>(
  data: T,
  dirtyFields: Partial<Readonly<FieldNamesMarkedBoolean<T>>>
): Partial<T> {
  const dirtyData: Record<string, unknown> = {};

  for (const field of Object.keys(dirtyFields)) {
    const value = data[field as keyof T];
    if (value !== undefined) dirtyData[field] = value;
  }

  return dirtyData as Partial<T>;
}
