import { useMutation } from '@tanstack/react-query';
import { createDeleteDPMutation, createUpsertDPMutation } from '../lib/mutationOptions';

export function useUpsertDPMutation() {
  return useMutation(createUpsertDPMutation());
}

export function useDeleteDPMutation() {
  return useMutation(createDeleteDPMutation());
}
