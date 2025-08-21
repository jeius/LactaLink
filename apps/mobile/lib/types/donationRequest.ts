import { User } from '@lactalink/types';
import { DONATION_CREATE_STEPS } from '../constants/donationRequest';

export type DonationCreateSteps = keyof typeof DONATION_CREATE_STEPS;

export type DonationCreateSearchParams = {
  matchedRequest?: string;
  recipientSlug?: NonNullable<User['profile']>['relationTo'];
  recipientID?: string;
};

export type RequestSearchParams = {
  requestedDonorId?: string;
  matchedDonation?: string;
};
