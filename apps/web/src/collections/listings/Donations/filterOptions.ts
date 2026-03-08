import { MILK_BAG_STATUS } from '@lactalink/enums';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { FilterOptions, Where } from 'payload';

export const filterMilkBagsOptions: FilterOptions<Donation> = async ({ data }) => {
  if (!data?.donor) {
    return false;
  }

  const allowedStatuses: string[] = [MILK_BAG_STATUS.DRAFT.value, MILK_BAG_STATUS.AVAILABLE.value];

  return {
    and: [
      { donor: { equals: extractID(data.donor) } },
      {
        status: {
          in: Object.keys(MILK_BAG_STATUS).filter((status) => allowedStatuses.includes(status)),
        },
      },
    ],
  } as Where;
};
