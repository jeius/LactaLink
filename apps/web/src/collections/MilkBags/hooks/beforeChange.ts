import { MilkBag } from '@lactalink/types/payload-generated-types';
import { CollectionBeforeChangeHook } from 'payload';
import { updateMilkStatus } from '../helpers';

export const beforeChange: CollectionBeforeChangeHook<MilkBag> = async ({
  data,
  operation,
  originalDoc,
}) => {
  // Create operations
  if (operation === 'create') {
    // Create operation hooks here if needed
  }

  // Update operations
  if (operation === 'update') {
    updateMilkStatus(data, originalDoc);
  }

  return data;
};
