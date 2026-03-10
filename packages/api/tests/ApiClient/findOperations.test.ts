import { Config, User } from '@lactalink/types/payload-generated-types';
import { beforeAll, describe, expect, it } from 'vitest';
import { ApiClient } from '../../src/v2/ApiClient';
import { createApiClientWithAdminUser } from '../helpers/createApiClient';

let apiClient: ApiClient<Config>;
let adminUser: User;

beforeAll(async () => {
  const { client, user } = await createApiClientWithAdminUser();
  apiClient = client;
  adminUser = user;
});

describe('Test suite for ApiClient findByID operation', () => {
  it('should find a record by ID', async () => {
    const adminUserRecord = await apiClient.findByID({
      collection: 'users',
      id: adminUser.id,
    });

    expect(adminUserRecord).toBeDefined();
    expect(adminUserRecord.id).toBe(adminUser.id);
    expect(adminUserRecord.email).toBe(adminUser.email);
  });

  it('should throw an error if no result found for a non-existent ID', async () => {
    const nonExistentId = 'non-existent-id';

    await expect(
      apiClient.findByID({
        collection: 'users',
        id: nonExistentId,
      })
    ).rejects.toThrow(Error);
  });
});

describe('Test suite for ApiClient find operations', () => {
  it('should return paginated results with a filter', async () => {
    const results = await apiClient.find({
      collection: 'users',
      where: { email: { equals: adminUser.email } },
    });
    expect(results.docs).toBeDefined();
    expect(results.totalDocs).toBeDefined();
    expect(results.docs.length).toBeGreaterThan(0);
    expect(results.totalDocs).toBe(results.docs.length);
    const foundUser = results.docs.find((user) => user.id === adminUser.id);
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(adminUser.email);
  });

  it('should return an empty array if no records match the filter', async () => {
    const results = await apiClient.find({
      collection: 'users',
      where: { email: { equals: 'non-existent-email' } },
    });
    expect(results.docs).toBeDefined();
    expect(results.totalDocs).toBe(0);
    expect(results.docs.length).toBe(0);
  });

  it(
    'should return an array if pagination is disabled',
    async () => {
      const results = await apiClient.find({
        collection: 'users',
        pagination: false,
        limit: 10,
      });
      expect(Array.isArray(results)).toBe(true);
    },
    1000 * 10 // 10 seconds timeout
  );
});
