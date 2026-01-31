import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { InfiniteDataMap } from '../types';

export function generatePlaceHoldersForInfQueries<T>(count: number): InfiniteDataMap<T, number> {
  return {
    pageParams: [1],
    pages: [
      {
        docs: new Map(generatePlaceHoldersWithID(count, {} as T).map((item) => [item.id, item])),
        hasNextPage: false,
        hasPrevPage: false,
        totalPages: 1,
        totalDocs: count,
        limit: count,
        pagingCounter: 1,
        nextPage: null,
        prevPage: null,
        page: 1,
      },
    ],
  };
}
