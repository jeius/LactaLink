import { User } from '@lactalink/types/payload-generated-types';
import { DONATION_CREATE_STEPS } from '../constants/donationRequest';

export type DonationCreateSteps = keyof typeof DONATION_CREATE_STEPS;

export type RecipientSearchParams = {
  rslg?: NonNullable<User['profile']>['relationTo'];
  rid?: string;
};

export type DonationCreateParams = RecipientSearchParams & {
  mrid?: string;
};

export type RequestCreateParams = RecipientSearchParams & {
  mdid?: string;
};
