import { AuthResult, User } from '@lactalink/types';
import { extractErrorMessage } from './errors';

type Params = {
  token: string;
  url: string | URL;
  collection?: 'users';
  tokenType: 'JWT' | 'Bearer';
};

export async function getMeUser(params: Params): Promise<AuthResult> {
  const { token, url, collection = 'users', tokenType } = params;
  const apiUrl = typeof url === 'string' ? url : url.origin;

  try {
    const res = await fetch(new URL(`/api/${collection}/me`, apiUrl), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${tokenType} ${token}`,
      },
    });

    const data = (await res.json()) as AuthResult;

    if (!res.ok) {
      let msg = data.message || 'An unexpected error occurred.';
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    return { message: extractErrorMessage(error), user: null };
  }
}

type CreateUserParams = Pick<Params, 'url' | 'collection'> & {
  data: {
    email: string;
    password: string;
  };
};

export async function createUser(params: CreateUserParams): Promise<AuthResult> {
  const { url, collection = 'users', data } = params;
  const apiUrl = typeof url === 'string' ? url : url.origin;

  try {
    const res = await fetch(new URL(`/api/${collection}`, apiUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const authRes = (await res.json()) as AuthResult;

    if (!res.ok) {
      const msg = authRes.message || 'An unexpected error occurred.';
      throw new Error(msg);
    }

    return authRes;
  } catch (error) {
    return { message: extractErrorMessage(error), user: null };
  }
}

export function isAuthSuccess(result: AuthResult): result is Extract<AuthResult, { user: User }> {
  return result.user !== null;
}
