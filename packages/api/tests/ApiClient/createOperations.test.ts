import { CollectionSlug } from '@lactalink/types/collections';
import { Config, User } from '@lactalink/types/payload-generated-types';
import { RecordsTracker } from '@lactalink/utilities';
import { extractID } from '@lactalink/utilities/extractors';
import { beforeAll, describe, expect, it } from 'vitest';
import { ApiClient } from '../../src/v2/ApiClient';
import { createApiClientWithAdminUser } from '../helpers/createApiClient';

let apiClient: ApiClient<Config>;
let adminUser: User;

const tracker = new RecordsTracker<CollectionSlug, string>();

beforeAll(async () => {
  const { client, user } = await createApiClientWithAdminUser();
  apiClient = client;
  adminUser = user;
});

describe('Test suite for ApiClient create operation', async () => {
  it('should create a new record in `Individuals`', async () => {
    const newIndividual = await apiClient.create({
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

    tracker.track('individuals', newIndividual.id);

    expect(newIndividual).toBeDefined();
    expect(newIndividual.id).toBeDefined();
    expect(newIndividual.givenName).toBe('Admin');
    expect(newIndividual.familyName).toBe('User');
    expect(newIndividual.birth).toBe(new Date('1990-01-01').toISOString());
    expect(newIndividual.gender).toBe('MALE');
    expect(newIndividual.maritalStatus).toBe('SINGLE');
    expect(extractID(newIndividual.owner)).toBe(adminUser.id);
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
