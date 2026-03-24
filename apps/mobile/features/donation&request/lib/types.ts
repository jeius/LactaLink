import { User } from '@lactalink/types/payload-generated-types';
import { DONATION_CREATE_STEPS } from './constants';

export type DonationCreateSteps = keyof typeof DONATION_CREATE_STEPS;

export type RecipientSearchParams = {
  /**
   * The recipient's relationTo value, used to filter potential requests/donations
   * to match with. Optional, but if provided, should be used in conjunction with
   * `rid` to ensure correct matching of requests/donations.
   */
  rslg?: NonNullable<User['profile']>['relationTo'];
  /**
   * The recipient's ID, used to filter potential requests/donations to match with.
   * Optional, but if provided, should be used in conjunction with `rslg` to ensure
   * correct matching of requests/donations.
   */
  rid?: string;
};

export type DonationCreateParams = RecipientSearchParams & {
  /**
   * The matched request ID, if the user is creating a donation in response to an existing request.
   * Optional, but if provided, indicates that the donation being created is intended to match with
   * an existing request, and can be used to pre-fill information or guide the user through the creation process.
   */
  mrid?: string;
};

export type RequestCreateParams = RecipientSearchParams & {
  /**
   * The matched donation ID, if the user is creating a request in response to an existing donation.
   * Optional, but if provided, indicates that the request being created is intended to match with
   * an existing donation, and can be used to pre-fill information or guide the user through the creation process.
   */
  mdid?: string;
};
