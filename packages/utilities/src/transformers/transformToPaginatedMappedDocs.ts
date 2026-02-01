import { PaginatedDocs } from '@lactalink/types/payload-types';

/**
 * Transforms PaginatedDocs to use a Map for the docs property.
 * @param paginatedDocs - `PaginatedDocs` object containing an array of documents.
 * @returns `PaginatedDocs` object with docs as a Map.
 */
export function transformToPaginatedMappedDocs<T extends { id: string }>(
  paginatedDocs: PaginatedDocs<T>
): Omit<PaginatedDocs<T>, 'docs'> & { docs: Map<string, T> } {
  return {
    ...paginatedDocs,
    docs: new Map(paginatedDocs.docs.map((doc) => [doc.id, doc])),
  };
}
