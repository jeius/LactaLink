import { ApiClient as ApiClientV2 } from '../../src/v2/ApiClient';
import { createSupabaseClient } from './createSupabaseClient';

export function createApiClientV2() {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error('API_URL is not defined in environment variables');
  }
  const supabase = createSupabaseClient();
  return new ApiClientV2({
    environment: 'expo',
    supabase: supabase,
    apiUrl: apiUrl,
  });
}

export async function createApiClientWithAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      '[createApiClientWithAdminUser]: Admin credentials are not defined in environment variables'
    );
  }

  const client = createApiClientV2();
  const user = await client.auth.signIn({
    email: adminEmail,
    password: adminPassword,
  });

  return { client, user };
}

export async function createApiClientWithTestUser() {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      '[createApiClientWithTestUser]: Test user credentials are not defined in environment variables'
    );
  }

  const client = createApiClientV2();
  const user = await client.auth.signIn({
    email: email,
    password: password,
  });

  return { client, user };
}
