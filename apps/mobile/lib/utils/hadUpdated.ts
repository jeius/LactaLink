import { Collections, PaginatedDocs } from '@lactalink/types';
import { InfiniteData } from '@tanstack/react-query';
import { isEqual } from 'lodash';

export function hadUpdated<T extends Collections>(
  old: InfiniteData<PaginatedDocs<T>> | null | undefined,
  current: InfiniteData<PaginatedDocs<T>> | null | undefined
) {
  if (!old && !current) return false;

  if (!old && current) return true;

  if (old && !current) return false;

  const oldTimestamps = old?.pages.flatMap((page) => page.docs.map((doc) => doc.updatedAt));
  const currentTimestamps = current?.pages.flatMap((page) => page.docs.map((doc) => doc.updatedAt));

  if (oldTimestamps?.length !== currentTimestamps?.length) return true;

  return !isEqual(oldTimestamps, currentTimestamps);
}
