import { z } from 'zod';

import { textAreaSchema } from '../textarea';
import {
  donationCreateSchema,
  donationDetailsSchema,
  donationSchema,
  donationUpdateSchema,
} from './donation';
import { recipientSchema } from './recipient';
import {
  requestCreateSchema,
  requestDetailsSchema,
  requestSchema,
  requestUpdateSchema,
} from './request';

export type DonationSchema = z.infer<typeof donationSchema>;
export type DonationCreateSchema = z.infer<typeof donationCreateSchema>;
export type DonationUpdateSchema = z.infer<typeof donationUpdateSchema>;
export type DonationDetailsSchema = z.infer<typeof donationDetailsSchema>;
export type RequestSchema = z.infer<typeof requestSchema>;
export type RequestCreateSchema = z.infer<typeof requestCreateSchema>;
export type RequestUpdateSchema = z.infer<typeof requestUpdateSchema>;
export type RequestDetailsSchema = z.infer<typeof requestDetailsSchema>;
export type NotesSchema = z.infer<typeof textAreaSchema>;
export type RecipientSchema = z.infer<typeof recipientSchema>;
