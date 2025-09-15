import { DAYS, DELIVERY_OPTIONS, DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { type MatchCriteriaSchema } from './schemas/matchCriteriaSchema';
import { type NearDonationRequestSchema } from './schemas/nearDonationRequestSchema';

export type DonationRequestStatus = keyof typeof DONATION_REQUEST_STATUS;
export type DeliveryMode = [keyof typeof DELIVERY_OPTIONS][number];
export type DeliveryDays = [keyof typeof DAYS][number];
export type NearOptions = NearDonationRequestSchema;
export type MatchCriteria = MatchCriteriaSchema;
