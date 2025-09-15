import { MILK_BAG_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { FilterOptions, Where } from 'payload';

export const filterMilkBagsOptions: FilterOptions<Transaction> = async ({ data, req }) => {
  if (!data?.donation) {
    return false;
  }

  const allowedStatuses: string[] = [MILK_BAG_STATUS.DRAFT.value, MILK_BAG_STATUS.AVAILABLE.value];

  const donation = await req.payload.findByID({
    collection: 'donations',
    id: extractID(data.donation),
    depth: 0,
    req,
    select: { details: true },
  });

  const bags = donation.details.bags;

  if (!bags) {
    return false;
  }

  return {
    and: [
      { id: { in: extractID(bags) } },
      {
        status: {
          in: Object.keys(MILK_BAG_STATUS).filter((status) => allowedStatuses.includes(status)),
        },
      },
    ],
  } as Where;
};
