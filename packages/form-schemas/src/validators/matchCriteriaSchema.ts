import z from 'zod';
import { nearDonationRequestSchema } from './nearDonationRequestSchema';

export const matchCriteriaSchema = z
  .object({
    nearestFirst: z.boolean(`Field 'nearestFirst' must be boolean.`).optional(),
    matchBy: z
      .array(z.enum(['deliveryMode', 'deliveryDays', 'barangay', 'cityMunicipality', 'province']))
      .optional(),
  })
  .and(nearDonationRequestSchema.omit({ location: true }));

export type MatchCriteria = z.infer<typeof matchCriteriaSchema>;
