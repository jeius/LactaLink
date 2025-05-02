import { extractErrorMessage } from './errors/extractError';

type BaseParams<T = unknown> = {
  authToken: string;
  key: string;
  apiUrl: string;
  value?: T;
};

type Success<T> = { data: T };
type Failure = { error: Error; message: string };
export type Result<T> = Success<T> | Failure;

type GetPreference<T> = {
  _id: string;
  key: string;
  user: string;
  userCollection: string;
  __v: number;
  value: T;
};

export async function getPreference<TValue = unknown>(
  params: Omit<BaseParams, 'value'>
): Promise<Result<GetPreference<TValue>>> {
  const { authToken, apiUrl: url, key } = params;
  const apiUrl = `${url}/api/payload-preferences/${key}`;

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      let msg = 'An unexpected error occurred.';
      if (data && typeof data === 'object' && 'message' in data) {
        msg = data.message as string;
      }
      throw new Error(msg);
    }

    return { data: data as GetPreference<TValue> };
  } catch (err) {
    return { message: extractErrorMessage(err), error: err as Error };
  }
}

type PostPreference<T = unknown> = {
  message: string;
  doc: {
    user: string;
    key: string;
    userCollection: string;
    value: T;
  };
};

export async function postPreference<T = unknown>(
  params: BaseParams<T>
): Promise<Result<PostPreference<T>>> {
  const { authToken, apiUrl: url, key, value } = params;
  const apiUrl = `${url}/api/payload-preferences/${key}`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${authToken}`,
      },
      body: JSON.stringify({ value }),
    });

    const data = await res.json();

    if (!res.ok) {
      let msg = 'An unexpected error occurred.';
      if (data && typeof data === 'object' && 'message' in data) {
        msg = data.message as string;
      }
      throw new Error(msg);
    }

    return { data: data as PostPreference<T> };
  } catch (err) {
    return { message: extractErrorMessage(err), error: err as Error };
  }
}
