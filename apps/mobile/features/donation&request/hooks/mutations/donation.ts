import { QUERY_KEYS } from '@/lib/constants';
import { DonationUpdateSchema } from '@lactalink/form-schemas/listings';
import { Donation } from '@lactalink/types/payload-generated-types';
import { AbortError } from '@lactalink/utilities/errors';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { updateDonation } from '../../lib/api/update';
import { addDonationToAllCaches } from '../../lib/cacheUtils';
import {
  createCancelDonationMutation,
  createDonationCreateMutation,
} from '../../lib/mutationOptions/donations';

export function useCancelDonation(doc: Donation | null | undefined) {
  const [controller, setController] = useState(new AbortController());

  const { reset, ...mutation } = useMutation(
    createCancelDonationMutation(doc, { signal: controller.signal })
  );

  const handleAbort = useCallback(() => {
    controller.abort();
    reset();
  }, [controller, reset]);

  useEffect(() => () => handleAbort(), [handleAbort]);

  return {
    ...mutation,
    reset,
    cancelMutate: () => {
      handleAbort();
      setController(new AbortController());
    },
  };
}

export function useDonationCreateMutation() {
  const [controller, setController] = useState(new AbortController());

  const { reset, ...mutation } = useMutation(
    createDonationCreateMutation({ signal: controller.signal })
  );

  const handleAbort = useCallback(() => {
    controller.abort();
    reset();
  }, [controller, reset]);

  useEffect(() => () => handleAbort(), [handleAbort]);

  return {
    ...mutation,
    reset,
    cancelMutate: () => {
      handleAbort();
      setController(new AbortController());
    },
  };
}

export function useUpdateDonationMutation(id: Donation['id']) {
  return useMutation({
    meta: {
      successMessage: 'Donation updated successfully!',
      errorMessage: (err) => {
        if (err instanceof AbortError) return 'Donation update cancelled.';
        return extractErrorMessage(err);
      },
    },
    mutationKey: ['donations', 'update', id],
    mutationFn: async ({ data }: { data: DonationUpdateSchema }) => {
      return updateDonation(data);
    },
    onSuccess: async (data, _vars, _ctx, { client }) => {
      addDonationToAllCaches(client, data);
      await client.invalidateQueries({ queryKey: QUERY_KEYS.DONATIONS.ALL });
    },
  });
}
