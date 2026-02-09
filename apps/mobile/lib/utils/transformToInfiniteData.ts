import { InfiniteDataMap } from '../types';

export function transformToInfiniteDataMap<T extends { id: string }>(
  initialData:
    | {
        docs?: (string | T)[];
        totalDocs?: number;
        hasNextPage?: boolean;
      }
    | undefined
    | null
): InfiniteDataMap<T, number> | undefined {
  if (!initialData) return undefined;

  const docsMap = new Map<string, T>();
  for (const doc of initialData.docs || []) {
    if (typeof doc === 'string') continue;
    docsMap.set(doc.id, doc);
  }

  const totalDocs = initialData.totalDocs ?? 0;
  const hasNextPage = initialData.hasNextPage ?? false;

  return {
    pageParams: [1],
    pages: [
      {
        docs: docsMap,
        totalDocs: totalDocs,
        limit: totalDocs,
        hasNextPage: hasNextPage,
        nextPage: hasNextPage ? 2 : null,
        hasPrevPage: false,
        prevPage: null,
        pagingCounter: 1,
        page: 1,
        totalPages: hasNextPage ? 2 : 1,
      },
    ],
  };
}
