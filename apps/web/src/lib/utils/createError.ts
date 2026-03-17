import status from 'http-status';
import { APIError } from 'payload';

export function createBadRequestError(message = 'Bad Request') {
  return new APIError(
    message,
    status.BAD_REQUEST,
    { message: status[`${status.BAD_REQUEST}_MESSAGE`] },
    true
  );
}

export function createAbortError(message = 'Request was cancelled.') {
  return new APIError(message, 499, { message: 'Client Closed Request' }, true);
}

export function createTimeoutError(message = 'Request was cancelled due to timeout.') {
  return new APIError(
    message,
    status.REQUEST_TIMEOUT,
    { message: status[`${status.REQUEST_TIMEOUT}_MESSAGE`] },
    true
  );
}
