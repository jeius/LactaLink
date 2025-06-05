import { MilkBag } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateTitle: CollectionBeforeChangeHook<MilkBag> = async ({ data }) => {
  if (!data.code || !data.volume) return data;

  data.title = `${data.code} - ${data.volume} mL`;

  return data;
};
