import { API_URL, MMKV_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';

export async function SignOut() {
  const res = await fetch(`${API_URL}/api/users/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errData = (await res.json()) as { message: string };
    throw new Error(errData.message);
  }

  Storage.delete(MMKV_KEYS.AUTH_TOKEN);
}
