import { transformToMilkBagSchema } from '@/lib/utils/transformData';
import { ImageSchema, MilkBagSchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { useMutation } from '@tanstack/react-query';
import { produce } from 'immer';
import { useEffect, useMemo } from 'react';
import { createMilkBag } from '../lib/api/create';
import { updateDraftMilkBag, updateDraftMilkBagImage } from '../lib/api/update';
import { addMilkBagToCache, updateMilkBagInCache } from '../lib/cacheUtils/milkbags';
import { createDonationCreateMutation } from '../lib/mutationOptions/donations';
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

export function useDonationCreateMutation() {
  const controller = useMemo(() => new AbortController(), []);

  const mutation = useMutation(createDonationCreateMutation({ signal: controller.signal }));

  useEffect(() => () => controller.abort(), [controller]);

  return { ...mutation, cancelMutate: () => controller.abort() };
}

export function useUploadBagImageMutation(
  milkbag: MilkBagSchema,
  onChange?: (data: MilkBagSchema) => void
) {
  return useMutation({
    meta: { errorMessage: (error) => 'Failed to upload image. ' + extractErrorMessage(error) },
    mutationFn: (imageData: ImageSchema) => updateDraftMilkBagImage(milkbag.id, imageData),
    onSuccess: (data, _vars, _ctx, { client }) => {
      updateMilkBagInCache(client, data);
      onChange?.(transformToMilkBagSchema(data));
    },
  });
}

export function useAddMilkBagMutation(
  milkbags?: MilkBagSchema[],
  onChange?: (data: MilkBagSchema[]) => void
) {
  return useMutation({
    meta: { errorMessage: (error) => 'Failed to add milk bag. ' + extractErrorMessage(error) },
    mutationFn: (bag: MilkBagSchema) => createMilkBag(bag),
    onMutate: (newBag) => {
      const prevSnapshot = milkbags;

      if (!milkbags || milkbags.length === 0) {
        onChange?.([newBag]);
      } else {
        onChange?.([...milkbags, newBag]);
      }

      return { prevSnapshot };
    },
    onError: (_error, _vars, ctx) => {
      if (ctx?.prevSnapshot) onChange?.(ctx.prevSnapshot);
    },
    onSuccess: (data, input, _ctx, { client }) => {
      addMilkBagToCache(client, data);
      if (!milkbags) return;
      const newMilkBags = new Map(milkbags.map((bag) => [bag.id, bag]));
      newMilkBags.set(data.id, transformToMilkBagSchema(data));
      newMilkBags.delete(input.id); // Remove the temp bag with the same ID, if it exists
      onChange?.(Array.from(newMilkBags.values()));
    },
  });
}

export function useUpdateMilkBagMutation(
  milkbags?: MilkBagSchema[],
  onChange?: (data: MilkBagSchema[]) => void
) {
  return useMutation({
    meta: { errorMessage: (error) => 'Failed to edit milk bag. ' + extractErrorMessage(error) },
    mutationFn: updateDraftMilkBag,
    onMutate: (newBag) => {
      const prevSnapshot = milkbags || [];

      if (!milkbags || milkbags.length === 0) {
        onChange?.([newBag]);
        return { prevSnapshot };
      }

      const index = milkbags.findIndex((bag) => bag.id === newBag.id);
      if (index === -1) {
        onChange?.([...milkbags, newBag]);
      } else {
        onChange?.(
          produce(milkbags, (draft) => {
            if (draft[index]) draft[index] = newBag;
          })
        );
      }

      return { prevSnapshot };
    },
    onError: (_error, _vars, ctx) => {
      if (ctx?.prevSnapshot) onChange?.(ctx.prevSnapshot);
    },
    onSuccess: (data, _vars, _ctx, { client }) => {
      if (data) updateMilkBagInCache(client, data);
      if (!milkbags) return;
      const newMilkBags = new Map(milkbags.map((bag) => [bag.id, bag]));
      newMilkBags.set(data.id, transformToMilkBagSchema(data));
      onChange?.(Array.from(newMilkBags.values()));
    },
  });
}
