import * as z from 'zod';

import { textAreaSchema } from '../textarea';
import {
  deliveryPreferencesSchema,
  donationDetailsSchema,
  donationSchema,
  donationUpdateSchema,
  matchedDonationSchema,
  matchedRequestSchema,
  requestDetailsSchema,
  requestSchema,
  requestUpdateSchema,
} from './schema';

export type DonationSchema = z.infer<typeof donationSchema>;
export type UpdateDonationSchema = z.infer<typeof donationUpdateSchema>;
export type RequestSchema = z.infer<typeof requestSchema>;
export type UpdateRequestSchema = z.infer<typeof requestUpdateSchema>;
export type DeliveryPreferencesSchema = z.infer<typeof deliveryPreferencesSchema>;
export type DonationDetailsSchema = z.infer<typeof donationDetailsSchema>;
export type NotesSchema = z.infer<typeof textAreaSchema>;
export type RequestDetailsSchema = z.infer<typeof requestDetailsSchema>;
export type MatchedDonationSchema = z.infer<typeof matchedDonationSchema>;
export type MatchedRequestSchema = z.infer<typeof matchedRequestSchema>;
