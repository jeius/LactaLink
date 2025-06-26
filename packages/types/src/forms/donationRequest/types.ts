import { z } from 'zod/v4';

import {
  createDonationSchema,
  createRequestSchema,
  deliveryDetailsSchema,
  deliverySchema,
  donationDetailsSchema,
  milkBagSchema,
  requestDetailsSchema,
  textAreaSchema,
} from './schema';

export type CreateDonationSchema = z.infer<typeof createDonationSchema>;
export type CreateRequestSchema = z.infer<typeof createRequestSchema>;
export type DeliverySchema = z.infer<typeof deliverySchema>;
export type DeliveryDetailsSchema = z.infer<typeof deliveryDetailsSchema>;
export type DonationDetailsSchema = z.infer<typeof donationDetailsSchema>;
export type MilkBagSchema = z.infer<typeof milkBagSchema>;
export type NotesSchema = z.infer<typeof textAreaSchema>;
export type RequestDetailsSchema = z.infer<typeof requestDetailsSchema>;
