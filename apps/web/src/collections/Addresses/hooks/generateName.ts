import { Address } from '@lactalink/types/payload-generated-types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateName: CollectionBeforeChangeHook<Address> = async ({
  data,
  req,
  operation,
}) => {
  if (data.name) return data;

  if (data.owner) {
    if (operation === 'create') {
      const { totalDocs } = await req.payload.count({
        collection: 'addresses',
        where: { owner: { equals: data.owner } },
      });

      data.name = `Address ${totalDocs + 1}`;
    } else if (operation === 'update') {
      const { docs } = await req.payload.find({
        collection: 'addresses',
        depth: 0,
        select: {},
        where: { owner: { equals: data.owner } },
        pagination: false,
        sort: 'createdAt',
      });

      const index = docs.findIndex((doc) => doc.id === data.id);
      data.name = `Address ${index + 1}`;
    }
  }

  return data;
};
