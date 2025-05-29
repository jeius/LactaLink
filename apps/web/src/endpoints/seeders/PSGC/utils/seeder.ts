/**
 * Imports various types and interfaces used in the seeder function.
 * These include types for PSGC inputs, outputs, and user roles.
 */
import {
  CollectionPSGC,
  CollectionSlugPSGC,
  ExistingDocs,
  RawPSGCDataMap,
  User,
} from '@lactalink/types';
import { batchProcess } from '@lactalink/utilities';
import { Payload } from 'payload';

/**
 * Represents the data structure for the resolved data.
 * Excludes metadata fields like `createdAt`, `id`, `sizes`, and `updatedAt`.
 */
type Data<T extends CollectionSlugPSGC> = Omit<
  CollectionPSGC<T>,
  'createdAt' | 'id' | 'sizes' | 'updatedAt'
>;

type SeedOptions<Slug extends CollectionSlugPSGC = CollectionSlugPSGC> = {
  /**
   * The name of the collection where the data will be seeded.
   */
  collection: Slug;

  /**
   * The Payload instance used for database operations.
   */
  payload: Payload;

  /**
   * The user performing the seeding operation.
   * Can be an Admin, a User, or null.
   */
  user:
    | (User & {
        collection: 'users';
      })
    | null;

  /**
   * The raw data to be seeded.
   */
  rawData: RawPSGCDataMap[Slug][];

  /**
   * A map of existing documents to avoid duplicate entries.
   * Keys are document codes, and values are document IDs.
   */
  existingDocs: ExistingDocs<Slug>;

  /**
   * A function to resolve raw input data into the desired format.
   * Can return a promise or a resolved data object.
   */
  resolveData: (item: RawPSGCDataMap[Slug]) => Promise<Data<Slug>> | Data<Slug>;
};

export async function seed<Slug extends CollectionSlugPSGC>({
  collection,
  payload,
  user,
  rawData,
  existingDocs,
  resolveData: resolveData,
}: SeedOptions<Slug>): Promise<ExistingDocs<Slug>> {
  await batchProcess(rawData, 500, async (item) => {
    // Skip items that already exist in the `existingDocs` map.
    if (existingDocs.get(item.code)) return;

    // Resolve the raw data into the desired format.
    const data = await resolveData(item);

    // Create a new document in the specified collection.
    const newDoc = await payload.create({
      collection,
      user,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
      select: { code: true, id: true },
    });

    // Add the new document to the `existingDocs` map.
    existingDocs.set(newDoc.code, newDoc.id);
  });

  // Return the updated map of existing documents.
  return existingDocs;
}
