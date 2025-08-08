export function generatePlaceHoldersWithID<T>(
  count: number,
  placeholder: T
): (T & { id: string })[] {
  return Array.from({ length: count }, (_, idx) => ({ ...placeholder, id: `placeholder-${idx}` }));
}

export function generatePlaceHolders<T>(count: number, placeholder: T): T[] {
  return Array.from({ length: count }, () => ({ ...placeholder }));
}
