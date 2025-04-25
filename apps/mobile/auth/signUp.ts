import { API_URL } from '@/lib/constants';
import { AuthResult } from '@lactalink/types';
import { createUser } from '@lactalink/utilities';

type SignUpParams = {
  email: string;
  password: string;
};
export async function signUp({ email, password }: SignUpParams): Promise<AuthResult> {
  return await createUser({ data: { email, password }, url: API_URL, collection: 'users' });
}
