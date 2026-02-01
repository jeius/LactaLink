import { useMutation } from '@tanstack/react-query';
import {
  createDonationReadMutation,
  createRequestReadMutation,
} from '../lib/mutationOptions/readMutations';

export function useDonationReadMutation() {
  return useMutation(createDonationReadMutation());
}

export function useRequestReadMutation() {
  return useMutation(createRequestReadMutation());
}
