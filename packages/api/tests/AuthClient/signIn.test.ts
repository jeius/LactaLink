import { beforeAll, describe, expect, it } from 'vitest';
import { IApiClient } from '../../src/v2/ApiClient';
import { createApiClientV2 } from '../helpers/createApiClient';

let apiClient: IApiClient;

beforeAll(async () => {
  apiClient = createApiClientV2();
});

describe('Test suite for AuthClient signIn operation', () => {
  it('should sign in a user with valid credentials', async () => {
    const email = process.env.USER_EMAIL;
    const password = process.env.USER_PASSWORD;

    if (!email || !password) {
      throw new Error(
        'USER_EMAIL and USER_PASSWORD environment variables must be set for this test'
      );
    }

    const user = await apiClient.auth.signIn({ email, password });

    expect(user).toBeDefined();
    expect(user.email).toBe(email);
  });

  it('should throw an error with invalid credentials', async () => {
    const email = 'nonexisting@gmail.com';
    const password = 'wrongpassword';

    await expect(apiClient.auth.signIn({ email, password })).rejects.toThrow(Error);
  });
});
