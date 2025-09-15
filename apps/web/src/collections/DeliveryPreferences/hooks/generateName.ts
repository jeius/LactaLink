import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateName: CollectionBeforeChangeHook<DeliveryPreference> = async ({
  data,
  req,
  operation,
}) => {
  if (data.name) return data;

  if (data.owner) {
    if (operation === 'create') {
      const { totalDocs } = await req.payload.count({
        collection: 'delivery-preferences',
        where: { owner: { equals: data.owner } },
      });

      data.name = `Delivery Preference ${totalDocs + 1}`;
    } else if (operation === 'update') {
      const { docs } = await req.payload.find({
        collection: 'delivery-preferences',
        depth: 0,
        select: {},
        where: { owner: { equals: data.owner } },
        pagination: false,
        sort: 'createdAt',
      });

      const index = docs.findIndex((doc) => doc.id === data.id);
      data.name = `Delivery Preference ${index + 1}`;
    }
  }

  return data;
};
