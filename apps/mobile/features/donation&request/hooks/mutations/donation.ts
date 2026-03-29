import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import {
  createCancelDonationMutation,
  createDonationCreateMutation,
} from '../../lib/mutationOptions/donations';

export function useCancelDonation() {
  return useMutation(createCancelDonationMutation());
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
