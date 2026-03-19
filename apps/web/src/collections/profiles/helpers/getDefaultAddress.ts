import { PayloadRequest } from 'payload';

/**
 * Retrieves the default address for a given profile owner.
 *
 * @param profileOwnerID - The ID of the profile owner for whom to retrieve the default address.
 * @param req - The Payload request object, used to perform the query operation on the addresses collection.
 * @returns The default `Address` document if found, or null if no default address exists for the profile owner.
 */
export async function getDefaultAddress(profileOwnerID: string, req: PayloadRequest) {
  const { docs: addresses } = await req.payload.find({
    collection: 'addresses',
    limit: 1,
    pagination: false,
    depth: 0,
    req,
    where: {
      and: [{ owner: { equals: profileOwnerID } }, { isDefault: { equals: true } }],
    },
  });

  return addresses.length > 0 ? addresses[0]! : null;
}
