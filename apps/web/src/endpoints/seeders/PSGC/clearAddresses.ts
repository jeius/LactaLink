import { CollectionSlug, PayloadRequest } from 'payload';

export async function clearAddresses(req: PayloadRequest) {
  const { payload, user } = req;

  // This array of collection slugs must be in this exact order
  // or it may cause foreign key issues.
  const collectionsToDelete: CollectionSlug[] = [
    'addresses',
    'barangays',
    'citiesMunicipalities',
    'provinces',
    'regions',
    'islandGroups',
  ];

  for (const collection of collectionsToDelete) {
    await payload.delete({
      collection,
      user,
      depth: 0,
      where: {},
    });
  }
}
