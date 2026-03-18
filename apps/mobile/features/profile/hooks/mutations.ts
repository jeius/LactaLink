import { PopulatedUserProfile } from '@lactalink/types';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import {
  createEditProfileMutationOptions,
  createNewProfileMutationOptions,
} from '../lib/mutationOptions';

export function useUpdateProfileMutation(profile: PopulatedUserProfile) {
  const controller = useMemo(() => new AbortController(), []);

  const mutation = useMutation(
    createEditProfileMutationOptions(profile, { signal: controller.signal })
  );

  useEffect(() => () => controller.abort(), [controller]);

  return { ...mutation, cancelMutate: () => controller.abort() };
}

export function useCreateProfileMutation() {
  const controller = useMemo(() => new AbortController(), []);

  const mutation = useMutation(createNewProfileMutationOptions({ signal: controller.signal }));

  useEffect(() => () => controller.abort(), [controller]);

  return { ...mutation, cancelMutate: () => controller.abort() };
}
