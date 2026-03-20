import { type Draft, produce } from 'immer';
import { InfiniteDataMap, PaginatedDocsMap } from '../types';

/**
 * Updates an item in the `InfiniteDataMap` at a specific position.
 *
 * @description
 * - If the item already exists, it is moved using the specified `method`.
 * - If the item does not exist, it is added using the specified `method`.
 *
 * @param data The existing infinite data map
 * @param item The item to be added or moved
 * @param method The method on how to update the item:
 *   - `'push'`: add/move to the end of the last page
 *   - `'unshift'`: add/move to the beginning of the first page
 *   - `'none'`: retain original position if exists, else uses `push` method
 *
 * @returns A new infinite data map with the item added or moved
 */
export function updateInfiniteDataMap<T extends { id: string }>(
  data: InfiniteDataMap<T>,
  item: T,
  method: 'push' | 'unshift' | 'none' = 'none'
): InfiniteDataMap<T> {
  return produce(data, (draft) => {
    if (draft.pages.length === 0) {
      draft.pageParams = [1];
      draft.pages = [createInitialPage(item)];
      return;
    }

    const allItems: Draft<T>[] = [];
    let itemFoundAtIndex = -1; // Track original position for 'none' method

    // Remove the item from any page it currently exists in and
    // collect all other items
    for (const page of draft.pages) {
      for (const doc of page.docs.values()) {
        if (doc.id === item.id) {
          itemFoundAtIndex = allItems.length;
        } else {
          allItems.push(doc);
        }
      }
    }

    // Add the new item at the specified position
    if (method === 'unshift') {
      allItems.unshift(item as Draft<T>);
    } else if (method === 'push') {
      allItems.push(item as Draft<T>);
    } else if (method === 'none') {
      // For 'none' method: retain position if exists, else push
      if (itemFoundAtIndex !== -1) {
        allItems.splice(itemFoundAtIndex, 0, item as Draft<T>);
      } else {
        allItems.push(item as Draft<T>);
      }
    }

    // Reconstruct the pages with the updated list of items
    const pageSize = draft.pages[0]?.limit ?? 10;
    draft.pages = reconstructPages(allItems, pageSize);
  });
}

/**
 * Removes an item from the `InfiniteDataMap` by its ID.
 *
 * @param data The existing infinite data map
 * @param itemId The ID of the item to be removed
 *
 * @returns A new infinite data map with the item removed
 */
export function removeItemFromInfiniteDataMap<T extends { id: string }>(
  data: InfiniteDataMap<T>,
  itemId: string
): InfiniteDataMap<T> {
  return produce(data, (draft) => {
    const allItems: Draft<T>[] = [];

    for (const page of draft.pages) {
      if (!page.docs.has(itemId)) {
        allItems.push(...page.docs.values());
        continue;
      }
      const docs = new Map(page.docs);
      docs.delete(itemId);
      allItems.push(...docs.values());
    }

    // Reconstruct the pages with the updated list of items
    const pageSize = draft.pages[0]?.limit ?? 10;
    draft.pages = reconstructPages(allItems, pageSize);
  });
}

//#region Helper functions -----------------------------------------------------------

/**
 * Creates the initial page structure for a single item.
 */
function createInitialPage<T extends { id: string }>(item: T): PaginatedDocsMap<Draft<T>> {
  return {
    docs: new Map([[item.id, item]]) as Map<string, Draft<T>>,
    page: 1,
    totalPages: 1,
    totalDocs: 1,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
    pagingCounter: 1,
    nextPage: null,
    prevPage: null,
  };
}

/**
 * Reconstructs pages from a flat list of items.
 */
function reconstructPages<T extends { id: string }>(
  items: Draft<T>[],
  pageSize: number
): PaginatedDocsMap<Draft<T>>[] {
  const totalDocs = items.length;
  const totalPages = Math.ceil(totalDocs / pageSize);

  return Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1;
    const start = index * pageSize;
    const pageItems = items.slice(start, start + pageSize);
    const docsMap = new Map(pageItems.map((item) => [item.id, item]));

    const hasNext = pageNumber < totalPages;
    const hasPrev = pageNumber > 1;

    return {
      docs: docsMap,
      page: pageNumber,
      totalPages,
      totalDocs,
      hasNextPage: hasNext,
      hasPrevPage: hasPrev,
      limit: pageSize,
      pagingCounter: start + 1,
      nextPage: hasNext ? pageNumber + 1 : null,
      prevPage: hasPrev ? pageNumber - 1 : null,
    };
  });
}

//#endregion
