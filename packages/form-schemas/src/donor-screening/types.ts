import { z } from 'zod';
import { donorScreeningFormSchema, sectionSchema } from './schema';

export type DonorScreeningFormSchema = z.infer<typeof donorScreeningFormSchema>;

export type SectionSchema = z.infer<typeof sectionSchema>;
