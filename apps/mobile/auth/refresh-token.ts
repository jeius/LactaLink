import { API_URL, MMKV_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { AuthResult } from '@lactalink/types';
import { getAuth } from './getAuth';

export async function RefreshToken(): Promise<AuthResult> {
  const token = Storage.getString(MMKV_KEYS.AUTH_TOKEN);

  if (!token) {
    return { user: null, message: 'No active session, user must sign in.' };
  }

  const res = await fetch(`${API_URL}/api/users/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
  });

  if (!res.ok) {
    const errData = (await res.json()) as { message: string };
    throw new Error(errData.message);
  }

  const data = (await res.json()) as AuthResult;

  if ('token' in data && data.token) {
    Storage.set(MMKV_KEYS.AUTH_TOKEN, data.token);
  }

  return await getAuth();
}
