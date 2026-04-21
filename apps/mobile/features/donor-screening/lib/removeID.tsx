export function removeID<T extends { id?: string | number | null }>(obj: T): Omit<T, 'id'> {
  const { id: _, ...rest } = obj;
  return rest;
}
