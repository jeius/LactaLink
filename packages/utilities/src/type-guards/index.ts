import type { Collection } from '@lactalink/types/collections';
import type {
  Donation,
  Hospital,
  Individual,
  Request,
} from '@lactalink/types/payload-generated-types';

export * from './stringChecker';
export * from './verifyOtp';

export function isDonation(data: Collection): data is Donation {
  return 'donor' in data;
}

export function isRequest(data: Collection): data is Request {
  return 'requester' in data;
}

export function isHospital(data: Collection): data is Hospital {
  return 'hospitalID' in data;
}

export function isMilkBank(data: Collection): data is Hospital {
  return 'head' in data && !('hospitalID' in data);
}

export function isIndividual(data: Collection): data is Individual {
  return 'givenName' in data && 'birth' in data;
}
