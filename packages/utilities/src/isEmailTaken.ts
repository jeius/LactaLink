import { stringify } from 'qs-esm';

type Params = {
  apiUrl: string;
  email: string;
};
export async function isEmailTaken(params: Params) {
  const { apiUrl: url, email } = params;
  const where = { email: { equals: email } };
  const query = stringify({ where });

  const apiUrl = `${url}/api/users?${query}`;

  const res = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const { errors } = (await res.json()) as { errors: { message: string }[] };
    return errors[0].message;
  }

  const { totalDocs } = (await res.json()) as { totalDocs: number };

  if (totalDocs > 0) return true;

  return false;
}
