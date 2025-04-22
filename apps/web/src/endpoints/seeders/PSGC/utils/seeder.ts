/**
 * Imports various types and interfaces used in the seeder function.
 * These include types for PSGC inputs, outputs, and user roles.
 */
import {
  Admin,
  Barangay,
  BarangayPSGC,
  CityMunicipality,
  CityMunicipalityPSGC,
  CollectionSlugPSGC,
  ExistingDocs,
  IslandGroup,
  IslandGroupPSGC,
  Province,
  ProvincePSGC,
  Region,
  RegionPSGC,
  User,
} from '@lactalink/types';
import { Payload } from 'payload';

/**
 * Represents the input types for the PSGC seeder.
 * These are specific to the PSGC hierarchy (e.g., IslandGroupPSGC, RegionPSGC).
 */
type PSGCInput = IslandGroupPSGC | RegionPSGC | ProvincePSGC | CityMunicipalityPSGC | BarangayPSGC;

/**
 * Represents the output types for the PSGC seeder.
 * These correspond to the actual entities (e.g., IslandGroup, Region).
 */
type Output = IslandGroup | Region | Province | CityMunicipality | Barangay;

/**
 * Represents the data structure for the resolved data.
 * Excludes metadata fields like `createdAt`, `id`, `sizes`, and `updatedAt`.
 */
type Data<T> = Omit<T, 'createdAt' | 'id' | 'sizes' | 'updatedAt'>;

/**
 * Represents the resolved data type after processing the input.
 */
type ResolvedData<T> = Data<T>;

/**
 * Options required for the seed function.
 * @template T - The input type (PSGCInput).
 * @template K - The output type (Output).
 */
type SeedOptions<T, K> = {
  /**
   * The name of the collection where the data will be seeded.
   */
  collection: CollectionSlugPSGC;

  /**
   * The Payload instance used for database operations.
   */
  payload: Payload;

  /**
   * The user performing the seeding operation.
   * Can be an Admin, a User, or null.
   */
  user:
    | (Admin & {
        collection: 'admins';
      })
    | (User & {
        collection: 'users';
      })
    | null;

  /**
   * The raw data to be seeded.
   */
  rawData: T[];

  /**
   * A map of existing documents to avoid duplicate entries.
   * Keys are document codes, and values are document IDs.
   */
  existingDocs: ExistingDocs;

  /**
   * A function to resolve raw input data into the desired format.
   * Can return a promise or a resolved data object.
   */
  resolveData: (item: T) => Promise<ResolvedData<K>> | ResolvedData<K>;
};

/**
 * Data seeder only for Island Groups, Regions, Provinces, Cities/Municipalities, Barangays.
 *
 * @template T - The input type (PSGCInput).
 * @template K - The output type (Output).
 *
 * @param {SeedOptions<T, K>} options - The options for the seeding operation.
 * @returns {Promise<ExistingDocs>} - A map of existing documents after seeding.
 *
 * @description
 * This function iterates over the raw data, resolves each item into the desired format,
 * and creates a new document in the specified collection if it doesn't already exist.
 * The function ensures no duplicate entries by checking the `existingDocs` map.
 */
export async function seed<T extends PSGCInput, K extends Output>({
  collection,
  payload,
  user,
  rawData,
  existingDocs,
  resolveData: resolveData,
}: SeedOptions<T, K>): Promise<ExistingDocs> {
  for (const item of rawData) {
    // Skip items that already exist in the `existingDocs` map.
    if (existingDocs[item.code]) continue;

    // Resolve the raw data into the desired format.
    const data = await resolveData(item);

    // Create a new document in the specified collection.
    const newDoc = await payload.create({
      collection,
      user,
      data,
      select: { code: true },
    });

    // Add the new document to the `existingDocs` map.
    existingDocs[newDoc.code] = newDoc.id;
  }

  // Return the updated map of existing documents.
  return existingDocs;
}
