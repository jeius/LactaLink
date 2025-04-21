/**
 * Processes an array of items in batches, executing a callback function on each item in parallel.
 *
 * @template T - The type of the input items.
 * @template R - The type of the result returned by the callback.
 *
 * @param {T[]} items - The array of items to process.
 * @param {number} batchSize - The number of items to process in each batch.
 * @param {(item: T) => Promise<R>} callback - The asynchronous callback function to execute for each item.
 * @returns {Promise<R[]>} - A promise that resolves to an array of results from the callback function.
 *
 * @description
 * This function splits the input array into smaller batches of the specified size and processes each batch in parallel.
 * It ensures that the callback function is executed for all items while limiting the number of concurrent operations.
 *
 * @example
 * const items = [1, 2, 3, 4, 5];
 * const results = await processInBatches(items, 2, async (item) => item * 2);
 * console.log(results); // [2, 4, 6, 8, 10]
 */
export const batchProcess = async <T, R>(
  items: T[],
  batchSize: number,
  callback: (item: T) => Promise<R>
): Promise<R[]> => {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(callback));
    results.push(...batchResults);
  }
  return results;
};

/**
 * Splits an array into smaller chunks of a specified size.
 *
 * @template T - The type of the elements in the array.
 *
 * @param {T[]} array - The array to split into chunks.
 * @param {number} size - The size of each chunk.
 * @returns {T[][]} - An array of chunks, where each chunk is an array of elements.
 *
 * @description
 * This function divides the input array into smaller arrays (chunks) of the specified size.
 * If the array cannot be evenly divided, the last chunk will contain the remaining elements.
 *
 * @example
 * const array = [1, 2, 3, 4, 5];
 * const chunks = getChunks(array, 2);
 * console.log(chunks); // [[1, 2], [3, 4], [5]]
 */
export function getChunks<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
