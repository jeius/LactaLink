import { addTransactionToAllCache } from '@/features/transactions/lib/cacheUtils';
import { DonationCreateSchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { mutationOptions } from '@tanstack/react-query';
import { createDonation } from '../api/create';
import { addDonationToAllCaches } from '../cacheUtils';

export function createDonationCreateMutation(init?: RequestInit) {
  return mutationOptions({
    meta: { errorMessage: (error) => 'Failed to create donation. ' + extractErrorMessage(error) },
    mutationFn: (data: DonationCreateSchema) => createDonation(data, init),
    onSuccess: (data, _vars, _ctx, { client }) => {
      if (!data) return; // No data means the mutation was cancelled, so we skip cache updates
      addDonationToAllCaches(client, data.donation);
      if (data.transaction) {
        addTransactionToAllCache(client, data.transaction);
      }
    },
  });
}
