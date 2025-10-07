import * as z from 'zod';
import { hospitalSchema, individualSchema, milkBankSchema, setupProfileSchema } from './schema';

export type IndividualSchema = z.infer<typeof individualSchema>;
export type HospitalSchema = z.infer<typeof hospitalSchema>;
export type MilkBankSchema = z.infer<typeof milkBankSchema>;
export type SetupProfileSchema = z.infer<typeof setupProfileSchema>;
