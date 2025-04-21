import { Admin, AuthResult, User } from '@lactalink/types';
import { extractErrorMessage } from './extractErrorMessage';

type Params = {
  authToken: string;
  url: string;
  collection: 'users' | 'admins';
};

export async function getMeUser(params: Params): Promise<AuthResult> {
  const { authToken, url, collection } = params;
  const apiUrl = `${url}/api/${collection}/auth`;

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${authToken}`,
      },
    });

    const data = (await res.json()) as AuthResult;

    if (!res.ok) {
      let msg = data.message || 'An unexpected error occurred.';
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    return { message: extractErrorMessage(error), user: null, error: error as Error };
  }
}

export function isAuthSuccess(
  result: AuthResult
): result is Extract<AuthResult, { user: User | Admin }> {
  return result.user !== null;
}
