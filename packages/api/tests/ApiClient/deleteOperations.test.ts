import { Config, User } from '@lactalink/types/payload-generated-types';
import { beforeAll, describe, expect, it } from 'vitest';
import { ApiClient } from '../../src/v2/ApiClient';
import { createApiClientWithAdminUser } from '../helpers/createApiClient';

let apiClient: ApiClient<Config>;
let adminUser: User;

function createIndividualForTesting() {
  return apiClient.create({
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
}

beforeAll(async () => {
  const { client, user } = await createApiClientWithAdminUser();
  apiClient = client;
  adminUser = user;
});

describe('Test suite for ApiClient delete operations', async () => {
  it('should delete the `Individual` using deleteByID', async () => {
    const individual = await createIndividualForTesting();

    await expect(
      apiClient.deleteByID({
        collection: 'individuals',
        id: individual.id,
      })
    ).resolves.toBeDefined();

    // Verify the record is deleted
    await expect(
      apiClient.findByID({
        collection: 'individuals',
        id: individual.id,
      })
    ).rejects.toThrow(Error);
  });

  it('should delete the `Individual` using the bulk operation', async () => {
    const individual = await createIndividualForTesting();

    await expect(
      apiClient.delete({
        collection: 'individuals',
        where: { id: { in: [individual.id] } },
      })
    ).resolves.toBeDefined();

    // Verify the record is deleted
    const results = await apiClient.find({
      collection: 'individuals',
      pagination: false,
      where: { id: { in: [individual.id] } },
    });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });
});
