import { z } from 'zod';

import { textAreaSchema } from '../textarea';
import {
  deliveryPreferencesSchema,
  donationCreateSchema,
  donationDetailsSchema,
  donationSchema,
  donationUpdateSchema,
  requestCreateSchema,
  requestDetailsSchema,
  requestSchema,
  requestUpdateSchema,
} from './schema';

export type DonationSchema = z.infer<typeof donationSchema>;
export type DonationCreateSchema = z.infer<typeof donationCreateSchema>;
export type DonationUpdateSchema = z.infer<typeof donationUpdateSchema>;
export type RequestSchema = z.infer<typeof requestSchema>;
export type RequestCreateSchema = z.infer<typeof requestCreateSchema>;
export type RequestUpdateSchema = z.infer<typeof requestUpdateSchema>;
export type DeliveryPreferencesSchema = z.infer<typeof deliveryPreferencesSchema>;
export type DonationDetailsSchema = z.infer<typeof donationDetailsSchema>;
export type NotesSchema = z.infer<typeof textAreaSchema>;
export type RequestDetailsSchema = z.infer<typeof requestDetailsSchema>;
