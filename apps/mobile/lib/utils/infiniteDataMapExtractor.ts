import { InfiniteDataMap } from '../types';

/**
 * Extracts data from an InfiniteDataMap and returns it as both an array and a map for easy access.
 * @param data - The InfiniteDataMap containing the paginated data.
 * @param callback - An optional callback function that is called for each item extracted.
 * @returns An object containing the data as an array and a map.
 */
export function infiniteDataMapExtractor<T extends { id: string }, V>(
  data: InfiniteDataMap<T, V> | undefined,
  callback?: (item: T) => void
): {
  dataArray: T[];
  dataMap: Map<string, T>;
} {
  const dataArray: T[] = [];
  const dataMap = new Map<string, T>();

  data?.pages.forEach((page) => {
    page.docs.forEach((item) => {
      dataArray.push(item);
      dataMap.set(item.id, item);
      callback?.(item);
    });
  });

  return { dataArray, dataMap };
}
