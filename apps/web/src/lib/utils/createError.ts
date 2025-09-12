import status from 'http-status';
import { APIError } from 'payload';

export function createBadRequestError(message: string) {
  return new APIError(message, status.BAD_REQUEST, null, true);
}
