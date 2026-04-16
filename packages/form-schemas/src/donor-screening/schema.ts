import { blockSchema } from '@/blocks';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { z } from 'zod';

const statuses: NonNullable<DonorScreeningForm['_status']>[] = ['draft', 'published'];

const organizationSchema = z.object(
  {
    relationTo: z.union([z.literal('hospitals'), z.literal('milkBanks')]),
    value: z.uuid(),
  },
  'Organization is required'
);

const sectionSchema = z.object({
  title: z.string('Section title is required').nonempty('Section title is required'),
  description: z.string().nullish(),
  fields: z.array(blockSchema).nullish(),
  id: z.string().nullish(),
});

export const donorScreeningFormSchema = z.object({
  _status: z.enum(statuses).nullish(),
  title: z.string('Title is required').nonempty('Title is required'),
  slug: z.string('Slug is required').nonempty('Slug is required'),
  isDefault: z.boolean().nullish(),
  organization: organizationSchema.nullish(),
  fields: z.array(blockSchema).nullish(),
  sections: z.array(sectionSchema).nullish(),
  submitButtonLabel: z.string().nullish(),
});
