import z from 'zod';
import { CollectionData } from '../collections';
import { Avatar } from '../payload-types';

function nullTransform(val: string) {
  if (typeof val === 'string' && val.trim() === '') {
    return null;
  }
  return val;
}

export const avatarSchema = z.custom<CollectionData<Avatar>>();

export const addressSchema = z.object({
  name: z.string().transform(nullTransform).optional().nullable(),
  street: z.string().transform(nullTransform).optional().nullable(),
  province: z.string().min(1, 'Required.'),
  cityMunicipality: z.string().min(1, 'Required.'),
  barangay: z.string().transform(nullTransform).optional().nullable(),
  zipCode: z.string().min(1, 'Required.'),
  default: z.boolean().optional(),
});

const baseSchema = z.object({
  addresses: z.array(addressSchema).min(1, 'Required atleast one address.'),
  phone: z
    .string()
    .max(16, 'Invalid phone number. (Max length 16)')
    .regex(/^$|^[\d+-]+$/, {
      message: 'Phone number can only contain digits, +, and -',
    })
    .transform(nullTransform)
    .optional()
    .nullable(),
  avatar: avatarSchema.optional().nullable(),
});

export const individualSchema = z.object({
  profileType: z.literal('INDIVIDUAL'),
  givenName: z.string().min(1, 'Required'),
  middleName: z.string().transform(nullTransform).optional().nullable(),
  familyName: z.string().min(1, 'Required'),
  birth: z.string().min(1, 'Required'),
  dependents: z.number().positive().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'SEPARATED', 'WIDOWED', 'DIVORCED', 'N/A']),
});

export const hospitalSchema = z.object({
  profileType: z.literal('HOSPITAL'),
  name: z.string().min(1, 'Required.'),
  description: z.string().transform(nullTransform).optional().nullable(),
  head: z.string().transform(nullTransform).optional().nullable(),
  hospitalID: z.string().transform(nullTransform).optional().nullable(),
  type: z.enum(['GOVERNMENT', 'PRIVATE', 'OTHER']),
});

export const milkBankSchema = z.object({
  profileType: z.literal('MILK_BANK'),
  name: z.string().min(1, 'Required.'),
  description: z.string().transform(nullTransform).optional().nullable(),
  head: z.string().transform(nullTransform).optional().nullable(),
  type: z.enum(['GOVERNMENT', 'PRIVATE', 'OTHER']),
});

export const setupProfileSchema = z
  .discriminatedUnion('profileType', [individualSchema, hospitalSchema, milkBankSchema])
  .and(baseSchema);

export type AvatarSchema = z.infer<typeof avatarSchema>;
export type AddressSchema = z.infer<typeof addressSchema>;
export type IndividualSchema = z.infer<typeof individualSchema>;
export type HospitalSchema = z.infer<typeof hospitalSchema>;
export type MilkBankSchema = z.infer<typeof milkBankSchema>;
export type SetupProfileSchema = z.infer<typeof setupProfileSchema>;
