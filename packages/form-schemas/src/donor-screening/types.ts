import { z } from 'zod';
import { donorScreeningFormSchema } from './schema';

export type DonorScreeningFormSchema = z.infer<typeof donorScreeningFormSchema>;
