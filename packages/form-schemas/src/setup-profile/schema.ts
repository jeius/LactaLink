import * as z from 'zod';

import { MARITAL_STATUS, ORGANIZATION_TYPES, PROFILE_TYPES } from '@lactalink/enums';
import { imageSchema } from '../file';
import { personalInfoSchema } from '../identity-verification';
import { nullTransform } from '../transformers';

const baseSchema = z.object({
  phone: z
    .string()
    .max(16, 'Invalid phone number. (Max length 16)')
    .regex(/^$|^[\d+-]+$/, {
      message: 'Phone number can only contain digits, +, and -',
    })
    .transform(nullTransform)
    .optional()
    .nullable(),
  avatar: imageSchema.optional().nullable(),
});

export const individualSchema = z.object({
  profileType: z.literal(PROFILE_TYPES.INDIVIDUAL.value),
  dependents: z.number().min(0).positive().optional(),
  maritalStatus: z
    .enum(
      Object.values(MARITAL_STATUS).map((item) => item.value),
      'Required'
    )
    .nonoptional(),
  ...personalInfoSchema.pick({
    givenName: true,
    middleName: true,
    familyName: true,
    birth: true,
    gender: true,
  }).shape,
});

export const hospitalSchema = z.object({
  profileType: z.literal(PROFILE_TYPES.HOSPITAL.value),
  name: z.string().nonempty('Name of the hospital required'),
  description: z.string().transform(nullTransform).optional().nullable(),
  head: z.string().transform(nullTransform).optional().nullable(),
  hospitalID: z.string().transform(nullTransform).optional().nullable(),
  type: z
    .enum(
      Object.values(ORGANIZATION_TYPES).map((item) => item.value),
      'Hospital type is required'
    )
    .nonoptional(),
});

export const milkBankSchema = z.object({
  profileType: z.literal(PROFILE_TYPES.MILK_BANK.value),
  name: z.string().nonempty('Name of the milk bank required'),
  description: z.string().transform(nullTransform).optional().nullable(),
  head: z.string().transform(nullTransform).optional().nullable(),
  type: z
    .enum(
      Object.values(ORGANIZATION_TYPES).map((item) => item.value),
      'Milk bank type is required'
    )
    .nonoptional(),
});

export const setupProfileSchema = z
  .discriminatedUnion('profileType', [individualSchema, hospitalSchema, milkBankSchema])
  .and(baseSchema);
