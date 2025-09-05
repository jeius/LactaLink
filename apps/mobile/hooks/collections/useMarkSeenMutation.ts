import { markSeen } from '@/lib/api/markSeen';
import {
  CollectionSlug,
  PaginatedDocs,
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
} from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

type Slug = Extract<CollectionSlug, 'donations' | 'notifications' | 'requests' | 'transactions'>;

type Collection<T extends Slug> = TransformCollectionWithSelect<T, SelectFromCollectionSlug<T>>;

type ListData<T extends Slug> = InfiniteData<PaginatedDocs<Collection<T>>>;

export function useMarkSeenMutation<T extends Slug>(collection: T, queryKey: unknown[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | string[]) => markSeen(collection, id),
    onMutate: async (inputData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<ListData<T>>(queryKey);

      if (previousData) {
        const updatedData = applyOptimisticUpdate(previousData, inputData);
        if (updatedData) {
          queryClient.setQueryData(queryKey, updatedData);
        }
      }

      return { previousData };
    },
    onSuccess: (updatedData) => {
      if (!updatedData?.length) return;

      queryClient.setQueryData<ListData<T>>(queryKey, (oldData) =>
        oldData ? applyServerUpdate(oldData, updatedData) : oldData
      );
    },
    onError: (err, vars, ctx) => {
      const message = extractErrorMessage(err);
      console.warn(`Failed to mark ${collection} as seen: ${message}`, { ids: vars });
      queryClient.setQueryData(queryKey, ctx?.previousData);
    },
  });
}

// Helper function for optimistic updates
function applyOptimisticUpdate<T extends Slug>(
  oldData: ListData<T>,
  inputData: string | string[]
): ListData<T> | undefined {
  const ids = Array.isArray(inputData) ? inputData : [inputData];

  if (!ids.length) return undefined;

  const seenMap = new Map(ids.map((id) => [id, { seen: true, seenAt: new Date().toISOString() }]));

  const newPages = oldData.pages.map((page) => ({
    ...page,
    docs: page.docs.map((item) =>
      seenMap.has(item.id) ? { ...item, ...seenMap.get(item.id) } : item
    ),
  }));

  return { ...oldData, pages: newPages };
}

// Helper function for server updates
function applyServerUpdate<T extends Slug>(
  oldData: ListData<T>,
  updatedData: Collection<T>[]
): ListData<T> {
  const updatedDataMap = new Map(updatedData.map((d) => [d.id, d]));

  const newPages = oldData.pages.map((page) => ({
    ...page,
    docs: page.docs.map((item) => updatedDataMap.get(item.id) || item),
  }));

  return { ...oldData, pages: newPages };
}
