import { useMutation } from '@tanstack/react-query';
import {
  createDonationReadMutation,
  createRequestReadMutation,
} from '../../lib/mutationOptions/readMutations';

export * from './milkbag';

export * from './donation';

export function useDonationReadMutation() {
  return useMutation(createDonationReadMutation());
}

export function useRequestReadMutation() {
  return useMutation(createRequestReadMutation());
}
