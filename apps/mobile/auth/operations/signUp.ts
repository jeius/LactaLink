import { API_URL, MMKV_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { AuthResult } from '@lactalink/types';

type SignUpParams = {
  email: string;
  password: string;
};
export async function SignUp({ email, password }: SignUpParams): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/api/users`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errData = (await res.json()) as { message: string };
    throw new Error(errData.message);
  }

  const data = (await res.json()) as AuthResult;

  if (data.token) {
    Storage.set(MMKV_KEYS.AUTH_TOKEN, data.token);
  }

  return data;
}
