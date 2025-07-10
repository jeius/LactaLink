import * as z from 'zod/v4';

import { textAreaSchema } from '../textarea';
import {
  deliveryPreferencesSchema,
  donationDetailsSchema,
  donationSchema,
  matchedDonationSchema,
  matchedRequestSchema,
  milkBagSchema,
  requestDetailsSchema,
  requestSchema,
} from './schema';

export type DonationSchema = z.infer<typeof donationSchema>;
export type RequestSchema = z.infer<typeof requestSchema>;
export type DeliveryPreferencesSchema = z.infer<typeof deliveryPreferencesSchema>;
export type DonationDetailsSchema = z.infer<typeof donationDetailsSchema>;
export type MilkBagSchema = z.infer<typeof milkBagSchema>;
export type NotesSchema = z.infer<typeof textAreaSchema>;
export type RequestDetailsSchema = z.infer<typeof requestDetailsSchema>;
export type MatchedDonationSchema = z.infer<typeof matchedDonationSchema>;
export type MatchedRequestSchema = z.infer<typeof matchedRequestSchema>;
