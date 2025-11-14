import type { Collection } from '@lactalink/types/collections';
import type {
  Address,
  Comment,
  Donation,
  Hospital,
  Individual,
  Post,
  Request,
} from '@lactalink/types/payload-generated-types';

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

export function isAddress(data: Collection): data is Address {
  return 'street' in data && 'zipCode' in data;
}

export function isPost(data: Collection): data is Post {
  return 'comments' in data && 'shares' in data;
}

export function isComment(data: Collection): data is Comment {
  return 'post' in data && 'parent' in data;
}
