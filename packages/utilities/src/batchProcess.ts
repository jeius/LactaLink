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
