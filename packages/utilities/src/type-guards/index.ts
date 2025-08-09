import { Donation, Request } from '@lactalink/types';

export * from './stringChecker';
export * from './verifyOtp';

export function isDonation(data: Donation | Request): data is Donation {
  return 'donor' in data;
}

export function isRequest(data: Donation | Request): data is Request {
  return 'requester' in data;
}
