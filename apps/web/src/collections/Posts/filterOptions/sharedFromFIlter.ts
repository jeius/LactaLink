import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { FilterOptions } from 'payload';

export const sharedFromFilter: FilterOptions = ({ relationTo }) => {
  if (relationTo === 'posts') return true;
  return {
    status: { in: [DONATION_REQUEST_STATUS.AVAILABLE.value] },
  };
};
