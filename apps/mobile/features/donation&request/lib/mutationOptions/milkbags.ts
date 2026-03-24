import { MilkBag } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { mutationOptions } from '@tanstack/react-query';
import { deleteMilkBag } from '../api/delete';
import { createDraftMilkbagsQuery } from '../queryOptions/milkbags';

export function createDeleteBagMutation() {
  const draftMilkbagsQueryOption = createDraftMilkbagsQuery();

  return mutationOptions({
    meta: { errorMessage: (error) => 'Failed to remove milk bag. ' + extractErrorMessage(error) },
    mutationFn: async (milkbag: MilkBag | undefined) => {
      if (!milkbag) return;
      return deleteMilkBag(milkbag.id);
    },
    onMutate: async (milkbag, { client }) => {
      const id = milkbag?.id;
      if (!id) return;

      await client.cancelQueries(draftMilkbagsQueryOption);

      const prevSnapshot = client.getQueryData(draftMilkbagsQueryOption.queryKey);

      client.setQueryData(draftMilkbagsQueryOption.queryKey, (old) => {
        if (!id || !old) return old;
        const newMap = new Map(old);
        newMap.delete(id);
        return newMap;
      });

      return { prevSnapshot };
    },
    onError: (_error, _id, ctx, { client }) => {
      if (ctx?.prevSnapshot) {
        client.setQueryData(draftMilkbagsQueryOption.queryKey, ctx.prevSnapshot);
      }
    },
  });
}
