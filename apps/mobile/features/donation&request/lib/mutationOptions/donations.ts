import { addTransactionToAllCache } from '@/features/transactions/lib/cacheUtils';
import { getMeUser } from '@/lib/stores/meUserStore';
import { DonationCreateSchema } from '@lactalink/form-schemas';
import { Donation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { mutationOptions } from '@tanstack/react-query';
import { createDonation } from '../api/create';
import { cancelListing } from '../api/update';
import {
  addDonationToAllCaches,
  addDonationToCache,
  addToUserDonationsInfCache,
  removeFromUserDonationsInfCache,
} from '../cacheUtils';

export function createDonationCreateMutation(init?: RequestInit) {
  return mutationOptions({
    mutationFn: (data: DonationCreateSchema) => createDonation(data, init),
    onSuccess: (data, _vars, _ctx, { client }) => {
      if (!data) return; // No data means the mutation was cancelled, so we skip cache updates
      addDonationToAllCaches(client, data.donation);
      if (data.transaction) {
        addTransactionToAllCache(client, data.transaction);
      }

      const meUser = getMeUser();
      if (meUser) {
        addToUserDonationsInfCache(client, { doc: data.donation, user: meUser });
      }
    },
  });
}

export function createCancelDonationMutation(init?: RequestInit) {
  return mutationOptions({
    mutationKey: ['cancel', 'donation'],
    mutationFn: async (doc: Donation) => {
      return cancelListing({ id: extractID(doc), slug: 'donations' }, init);
    },
    onSuccess: (data, vars, _ctx, { client }) => {
      addDonationToCache(client, data);

      const meUser = getMeUser();
      if (!meUser) return;

      addToUserDonationsInfCache(client, { doc: data, user: meUser });
      removeFromUserDonationsInfCache(client, { doc: vars, user: meUser });
    },
  });
}
