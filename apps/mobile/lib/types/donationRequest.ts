import { DONATION_CREATE_STEPS } from '../constants/donationRequest';

export type DonationCreateSteps = keyof typeof DONATION_CREATE_STEPS;

export type DonationCreateSearchParams = {
  matchedRequest?: string;
  step: DonationCreateSteps;
};

export type RequestSearchParams = {
  requestedDonorId?: string;
  matchedDonation?: string;
};
