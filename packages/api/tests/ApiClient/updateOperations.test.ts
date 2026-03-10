import { CollectionSlug } from '@lactalink/types/collections';
import { Config, Individual, User } from '@lactalink/types/payload-generated-types';
import { RecordsTracker } from '@lactalink/utilities';
import { beforeAll, describe, expect, it } from 'vitest';
import { ApiClient } from '../../src/v2/ApiClient';
import { createApiClientWithAdminUser } from '../helpers/createApiClient';

let apiClient: ApiClient<Config>;
let adminUser: User;
let individual: Individual;

const tracker = new RecordsTracker<CollectionSlug, string>();

beforeAll(async () => {
  const { client, user } = await createApiClientWithAdminUser();
  apiClient = client;
  adminUser = user;

  individual = await apiClient.create({
    collection: 'individuals',
    data: {
      givenName: 'Admin',
      familyName: 'User',
      birth: new Date('1990-01-01').toISOString(),
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      owner: adminUser.id,
    },
  });

  tracker.track('individuals', individual.id);
});

describe('Test suite for ApiClient update operations', async () => {
  it('should update the `Individual` using updateByID', async () => {
    const updatedIndividual = await apiClient.updateByID({
      collection: 'individuals',
      id: individual.id,
      data: {
        givenName: 'Updated',
        familyName: 'User',
      },
    });

    expect(updatedIndividual).toBeDefined();
    expect(updatedIndividual.id).toBe(individual.id);
    expect(updatedIndividual.givenName).toBe('Updated');
    expect(updatedIndividual.familyName).toBe('User');
  });

  it('should update the `Individual` using the bulk operation and returns an array', async () => {
    const updatedIndividuals = await apiClient.update({
      collection: 'individuals',
      where: { id: { in: [individual.id] } },
      data: {
        givenName: 'Updated Again',
        familyName: 'User',
      },
    });

    expect(Array.isArray(updatedIndividuals)).toBe(true);
    expect(updatedIndividuals.length).toBeGreaterThan(0);
    const updatedIndividual = updatedIndividuals[0];
    expect(updatedIndividual).toBeDefined();
    expect(updatedIndividual.id).toBe(individual.id);
    expect(updatedIndividual.givenName).toBe('Updated Again');
    expect(updatedIndividual.familyName).toBe('User');
  });
});

afterAll(async () => {
  // Clean up created records
  const createdRecords = tracker.getAllRecords();
  for (const [collection, ids] of createdRecords.entries()) {
    try {
      await apiClient.delete({
        collection,
        where: { id: { in: Array.from(ids) } },
      });
    } catch (error) {
      console.error(`Failed to delete records from collection ${collection}:`, error);
    }
  }
});
