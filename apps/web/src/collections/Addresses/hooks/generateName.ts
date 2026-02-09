import { Address } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { FieldHook } from 'payload';

export const generateName: FieldHook<Address> = async ({ data, req, operation, value }) => {
  if (value) return value;

  if (!data?.owner) return value;

  if (operation === 'create') {
    // Count existing addresses for the owner
    const { totalDocs } = await req.payload.count({
      collection: 'addresses',
      where: { owner: { equals: extractID(data.owner) } },
      req,
    });

    // Address count is zero-based, so add 1 for the new address
    return `Address ${totalDocs + 1}`;
  } else if (operation === 'update') {
    // Fetch all addresses for the owner to determine the index of the current address
    const { docs } = await req.payload.find({
      collection: 'addresses',
      depth: 0,
      where: { owner: { equals: extractID(data.owner) } },
      pagination: false,
      sort: 'createdAt',
      req,
    });

    // Find the index of the current address
    const index = docs.findIndex((doc) => doc.id === data.id);

    // If not found, return the original value
    if (index === -1) return value;

    // Index is zero-based, so add 1 for human-friendly numbering
    return `Address ${index + 1}`;
  }

  return value;
};
