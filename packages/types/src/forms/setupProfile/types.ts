import z from 'zod';
import {
  addressSchema,
  avatarSchema,
  hospitalSchema,
  individualSchema,
  milkBankSchema,
  setupProfileSchema,
} from './schema';

export type AvatarSchema = z.infer<typeof avatarSchema>;
export type AddressSchema = z.infer<typeof addressSchema>;
export type IndividualSchema = z.infer<typeof individualSchema>;
export type HospitalSchema = z.infer<typeof hospitalSchema>;
export type MilkBankSchema = z.infer<typeof milkBankSchema>;
export type SetupProfileSchema = z.infer<typeof setupProfileSchema>;
