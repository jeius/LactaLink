/**
 * Key extractore for FlatList or FlashList when items have an 'id' field.
 * @param item - item in the list
 * @param index - index of the item
 * @returns - unique key string
 */
export function listKeyExtractor<T extends { id: string }>(item: T, index: number): string {
  return `${item.id}-${index}`;
}
