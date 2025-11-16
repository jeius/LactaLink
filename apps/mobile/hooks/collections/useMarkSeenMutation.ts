import { markSeen } from '@/lib/api/markSeen';
import { InfiniteDataMap } from '@/lib/types';
import {
  CollectionSlug,
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
} from '@lactalink/types/payload-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';

type Slug = Extract<CollectionSlug, 'notifications'>;

type Collection<T extends Slug> = TransformCollectionWithSelect<T, SelectFromCollectionSlug<T>>;

type ListData<T extends Slug> = InfiniteDataMap<Collection<T>>;

export function useMarkSeenMutation<T extends Slug>(collection: T, queryKey: QueryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { invalidatesQuery: queryKey },
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
    onError: (err, vars, ctx) => {
      const message = extractErrorMessage(err);
      console.warn(`Failed to mark ${collection} as seen: ${message}`, { ids: vars });
      if (!ctx) return;
      queryClient.setQueryData(queryKey, ctx.previousData);
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
  return produce(oldData, (draft) => {
    for (const page of draft.pages) {
      for (const id of ids) {
        const doc = page.docs.get(id);
        if (doc) {
          doc.seen = true;
          doc.seenAt = new Date().toISOString();
          page.docs = new Map(page.docs).set(id, doc);
        }
      }
    }
  });
}
