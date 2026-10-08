import { beforeEach, expect, it, vi } from 'vitest';
import { AuthError } from '@supabase/supabase-js';

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), exchange: vi.fn() }));
vi.mock('@lactalink/api', () => ({
  getApiClient: () => ({ auth: { signInWithIdToken: mocks.exchange } }),
}));
vi.mock('@lactalink/utilities/extractors', () => ({ extractName: () => 'Test user' }));
vi.mock('../../../mobile/node_modules/@react-native-google-signin/google-signin', () => ({
  GoogleSignin: { hasPlayServices: vi.fn(), signIn: mocks.signIn },
  isErrorWithCode: (error: { code?: string }) => typeof error?.code === 'string',
  isSuccessResponse: (result: { type: string }) => result.type === 'success',
  statusCodes: {
    PLAY_SERVICES_NOT_AVAILABLE: 'unavailable', SIGN_IN_CANCELLED: 'cancelled',
    IN_PROGRESS: 'in_progress', SIGN_IN_REQUIRED: 'required',
  },
}));

import { signInWithGoogle } from '../../../mobile/auth/googleSignIn';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.signIn.mockResolvedValue({ type: 'success', data: { idToken: 'test-token' } });
});

it('preserves Supabase errors, including their status and code', async () => {
  const error = new AuthError('Provider is disabled', 400, 'provider_disabled');
  mocks.exchange.mockRejectedValue(error);
  await expect(signInWithGoogle()).rejects.toBe(error);
});

it('retains unrecognized native Google errors and codes', async () => {
  mocks.signIn.mockRejectedValue(Object.assign(new Error('DEVELOPER_ERROR'), { code: '10' }));
  await expect(signInWithGoogle()).rejects.toThrow('DEVELOPER_ERROR (code: 10)');
});

it('reports known Play Services errors', async () => {
  mocks.signIn.mockRejectedValue({ code: 'unavailable' });
  await expect(signInWithGoogle()).rejects.toThrow('Play services not available or outdated.');
});

it('still completes successful authentication', async () => {
  mocks.exchange.mockResolvedValue({ email: 'test@example.com' });
  await expect(signInWithGoogle()).resolves.toBe('Welcome! Test user');
  expect(mocks.exchange).toHaveBeenCalledWith({ token: 'test-token', provider: 'google' });
});
