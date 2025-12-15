import { getApiClient } from '@lactalink/api';
import { MILK_BAG_STATUS } from '@lactalink/enums';
import { User } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { queryOptions } from '@tanstack/react-query';

export function createDraftMilkbagsQuery(user: User | null = null) {
  const profileID = extractID(user?.profile?.value);

  return queryOptions({
    enabled: !!profileID,
    queryKey: ['milkbags', 'draft', profileID || 'guest'],
    queryFn: async () => {
      if (!profileID) throw new Error('Profile is required to fetch draft milk bags.');

      const apiClient = getApiClient();

      const docs = await apiClient.find({
        collection: 'milkBags',
        sort: 'createdAt',
        depth: 3,
        pagination: false,
        where: {
          and: [
            { status: { equals: MILK_BAG_STATUS.DRAFT.value } },
            { donor: { equals: profileID } },
          ],
        },
      });

      return new Map(docs.map((doc) => [doc.id, doc]));
    },
  });
}
