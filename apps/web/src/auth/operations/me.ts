import { getServerSideURL } from '@/lib/utils';
import { status as httpStatus } from 'http-status';
import { APIError } from 'payload';

export async function meOperation(token: string | null) {
  if (!token) {
    throw new APIError('Missing Token', httpStatus.NOT_FOUND);
  }
  const meResponse = await fetch(`${getServerSideURL()}/api/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
  });

  if (!meResponse.ok) {
    const errData = await meResponse.json();
    throw new APIError(errData.message, httpStatus.EXPECTATION_FAILED);
  }

  const data = await meResponse.json();
  return data;
}
