import z from 'zod';

export const addressSchema = z.object({
  name: z.string().optional(),
  street: z.string().optional(),
  province: z.string().min(1, 'Required.'),
  cityMunicipality: z.string().min(1, 'Required.'),
  barangay: z.string().optional(),
  zipCode: z.string().min(1, 'Required.'),
  default: z.boolean().optional(),
});

const baseSchema = z.object({
  addresses: z.array(addressSchema).min(1, 'Required atleast one address.'),
  phone: z.string().optional(),
});

export const individualSchema = z.object({
  profileType: z.literal('INDIVIDUAL'),
  givenName: z.string().min(1, 'Required'),
  middleName: z.string().optional(),
  familyName: z.string().min(1, 'Required'),
  birth: z.date(),
  dependents: z.number().positive().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'SEPARATED', 'WIDOWED', 'DIVORCED', 'N/A']),
});

export const hospitalSchema = z.object({
  profileType: z.literal('HOSPITAL'),
  name: z.string().min(1, 'Required.'),
  description: z.string().optional(),
  head: z.string().optional(),
  hospitalID: z.string().optional(),
  type: z.enum(['GOVERNMENT', 'PRIVATE', 'OTHER']),
});

export const milkBankSchema = z.object({
  profileType: z.literal('MILK_BANK'),
  name: z.string().min(1, 'Required.'),
  description: z.string().optional(),
  head: z.string().optional(),
  type: z.enum(['GOVERNMENT', 'PRIVATE', 'OTHER']),
});

export const setupProfileSchema = z
  .discriminatedUnion('profileType', [individualSchema, hospitalSchema, milkBankSchema])
  .and(baseSchema);

export type AddressSchema = z.infer<typeof addressSchema>;
export type IndividualSchema = z.infer<typeof individualSchema>;
export type HospitalSchema = z.infer<typeof hospitalSchema>;
export type MilkBankSchema = z.infer<typeof milkBankSchema>;
export type SetupProfileSchema = z.infer<typeof setupProfileSchema>;
