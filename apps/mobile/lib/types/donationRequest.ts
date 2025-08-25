import { User } from '@lactalink/types';
import { DONATION_CREATE_STEPS } from '../constants/donationRequest';

export type DonationCreateSteps = keyof typeof DONATION_CREATE_STEPS;

export type RecipientSearchParams = {
  recipientSlug?: NonNullable<User['profile']>['relationTo'];
  recipientID?: string;
};

export type DonationCreateSearchParams = RecipientSearchParams & {
  matchedRequest?: string;
};

export type RequestSearchParams = RecipientSearchParams & {
  matchedDonation?: string;
};
