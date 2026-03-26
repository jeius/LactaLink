import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { createDonationCreateMutation } from '../../lib/mutationOptions/donations';
import {
  createDonationReadMutation,
  createRequestReadMutation,
} from '../../lib/mutationOptions/readMutations';

export * from './milkbag';

export function useDonationReadMutation() {
  return useMutation(createDonationReadMutation());
}

export function useRequestReadMutation() {
  return useMutation(createRequestReadMutation());
}

export function useDonationCreateMutation() {
  const controller = useMemo(() => new AbortController(), []);

  const mutation = useMutation(createDonationCreateMutation({ signal: controller.signal }));

  useEffect(() => () => controller.abort(), [controller]);

  return { ...mutation, cancelMutate: () => controller.abort() };
}
