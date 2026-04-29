import z from 'zod';
import { nearListingsOptionsSchema } from './nearOptions';

export const matchCriteriaSchema = z
  .object({
    nearestFirst: z.boolean(`Field 'nearestFirst' must be boolean.`).optional(),
    matchBy: z
      .array(z.enum(['deliveryMode', 'deliveryDays', 'barangay', 'cityMunicipality', 'province']))
      .optional(),
  })
  .and(nearListingsOptionsSchema.omit({ location: true }));

export type MatchCriteria = z.infer<typeof matchCriteriaSchema>;
