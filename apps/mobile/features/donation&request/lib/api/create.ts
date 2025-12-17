import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { MILK_BAG_STATUS } from '@lactalink/enums';
import { MilkBagCreateSchema } from '@lactalink/form-schemas';
import { extractID } from '@lactalink/utilities/extractors';

export function createMilkBag({ volume, collectedAt, donor }: Omit<MilkBagCreateSchema, 'id'>) {
  const meUser = getMeUser();
  if (!meUser) throw new Error('User must be logged in to create a milk bag.');
  if (!meUser.profile) throw new Error('User must have a profile to create a milk bag.');

  const apiClient = getApiClient();

  return apiClient.create({
    collection: 'milkBags',
    data: {
      status: MILK_BAG_STATUS.DRAFT.value,
      volume: volume,
      collectedAt: collectedAt,
      donor: donor,
      owner: {
        relationTo: meUser.profile.relationTo,
        value: extractID(meUser.profile.value),
      },
    },
  });
}
