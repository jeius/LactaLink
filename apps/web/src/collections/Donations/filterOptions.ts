import { MILK_BAG_STATUS } from '@lactalink/enums';
import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { FilterOptions, Where } from 'payload';

export const filterMilkBagsOptions: FilterOptions<Donation> = async ({ data }) => {
  if (!data?.donor) {
    return false;
  }

  return {
    and: [
      { donor: { equals: extractID(data.donor) } },
      {
        status: {
          in: Object.keys(MILK_BAG_STATUS).filter((status) =>
            [MILK_BAG_STATUS.DRAFT.value, MILK_BAG_STATUS.AVAILABLE.value].includes(status)
          ),
        },
      },
    ],
  } as Where;
};
