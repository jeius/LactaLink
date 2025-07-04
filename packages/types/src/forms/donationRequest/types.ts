import { z } from 'zod/v4';

import { deliveryPreferenceSchema } from '../deliveryPreference';
import { textAreaSchema } from '../textarea';
import {
  deliveryPreferencesSchema,
  donationDetailsSchema,
  donationSchema,
  milkBagSchema,
  requestDetailsSchema,
  requestSchema,
} from './schema';

export type DonationSchema = z.infer<typeof donationSchema>;
export type RequestSchema = z.infer<typeof requestSchema>;
export type DeliveryPreferenceSchema = z.infer<typeof deliveryPreferenceSchema>;
export type DeliveryPreferencesSchema = z.infer<typeof deliveryPreferencesSchema>;
export type DonationDetailsSchema = z.infer<typeof donationDetailsSchema>;
export type MilkBagSchema = z.infer<typeof milkBagSchema>;
export type NotesSchema = z.infer<typeof textAreaSchema>;
export type RequestDetailsSchema = z.infer<typeof requestDetailsSchema>;
