import { GENDER_TYPES, ID_TYPES } from '@lactalink/enums';
import { z } from 'zod';
import { imageSchema } from './file';
import { nullTransform } from './transformers';

export const personalInfoSchema = z.object({
  givenName: z.string().nonempty('Given name is required'),
  middleName: z.string().transform(nullTransform).optional().nullable(),
  familyName: z.string().nonempty('Family name is required'),
  suffix: z.string().transform(nullTransform).optional().nullable(),
  birth: z.string().nonempty('Please enter your date of birth').optional(),
  gender: z
    .enum(
      Object.values(GENDER_TYPES).map((item) => item.value),
      'Sex/Gender is required'
    )
    .optional(),
});

export const idDocumentSchema = z.object({
  idNumber: z.string().nonempty('ID number is required'),
  idType: z
    .enum(
      Object.values(ID_TYPES).map((item) => item.value),
      'Please select an ID type'
    )
    .nonoptional(),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
});

export const identitySchema = z.object({
  personalInfo: z.object({
    ...personalInfoSchema.omit({ gender: true }).shape,
    address: z.string().transform(nullTransform).optional().nullable(),
  }),
  details: idDocumentSchema,
  idImage: imageSchema.nonoptional('Photo of the ID is required'),
  faceImage: imageSchema.nonoptional('Selfie image is required'),
});

export type IdentitySchema = z.infer<typeof identitySchema>;
export type PersonalInfoSchema = z.infer<typeof personalInfoSchema>;
export type IdDocumentSchema = z.infer<typeof idDocumentSchema>;
