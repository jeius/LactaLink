import { useMutation } from '@tanstack/react-query';
import {
  createMarkAsReadMutationOptions,
  createMarkAsSeenMutationOptions,
} from '../lib/mutationOptions';

export function useMarkNotifAsSeenMutation() {
  return useMutation(createMarkAsSeenMutationOptions());
}

export function useMarkNotifAsReadMutation() {
  return useMutation(createMarkAsReadMutationOptions());
}
