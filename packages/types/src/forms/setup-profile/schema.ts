import * as z from 'zod/v4';

import { GENDER_TYPES, MARITAL_STATUS, ORGANIZATION_TYPES, PROFILE_TYPES } from '@lactalink/enums';
import { addressSchema } from '../address';
import { imageSchema } from '../file';
import { nullTransform } from '../transformers';

const baseSchema = z.object({
  addresses: z.array(addressSchema).nonempty('Required atleast one address.'),
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
  givenName: z.string().nonempty('Required'),
  middleName: z.string().transform(nullTransform).optional().nullable(),
  familyName: z.string().nonempty('Required'),
  birth: z.string().nonempty('Required'),
  dependents: z.number().min(0).positive().optional(),
  gender: z
    .enum(
      Object.values(GENDER_TYPES).map((item) => item.value),
      'Required'
    )
    .nonoptional(),
  maritalStatus: z
    .enum(
      Object.values(MARITAL_STATUS).map((item) => item.value),
      'Required'
    )
    .nonoptional(),
});

export const hospitalSchema = z.object({
  profileType: z.literal(PROFILE_TYPES.HOSPITAL.value),
  name: z.string().nonempty('Required.'),
  description: z.string().transform(nullTransform).optional().nullable(),
  head: z.string().transform(nullTransform).optional().nullable(),
  hospitalID: z.string().transform(nullTransform).optional().nullable(),
  type: z
    .enum(
      Object.values(ORGANIZATION_TYPES).map((item) => item.value),
      'Required'
    )
    .nonoptional(),
});

export const milkBankSchema = z.object({
  profileType: z.literal(PROFILE_TYPES.MILK_BANK.value),
  name: z.string().nonempty('Required.'),
  description: z.string().transform(nullTransform).optional().nullable(),
  head: z.string().transform(nullTransform).optional().nullable(),
  type: z
    .enum(
      Object.values(ORGANIZATION_TYPES).map((item) => item.value),
      'Required'
    )
    .nonoptional(),
});

export const setupProfileSchema = z
  .discriminatedUnion('profileType', [individualSchema, hospitalSchema, milkBankSchema])
  .and(baseSchema);
