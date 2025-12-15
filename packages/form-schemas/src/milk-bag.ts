import { MILK_BAG_STATUS } from '@lactalink/enums/milkbags';
import * as z from 'zod';
import { imageSchema } from './file';

export const milkBagSchema = z.object({
  id: z.uuid().nonempty('Required'),
  donor: z.uuid().nonempty('Required'),
  volume: z.number('Volume is required.').min(20, 'Atleast 20mL').positive(),
  status: z.enum(
    Object.values(MILK_BAG_STATUS).map((item) => item.value),
    'Required'
  ),
  code: z.string().optional().nullable(),
  collectedAt: z.iso.datetime('Required'),
  bagImage: imageSchema.optional().nullable(),
});

export const createMilkBagSchema = z.object({
  id: z.string(),
  ...milkBagSchema.omit({
    id: true,
    code: true,
    bagImage: true,
    status: true,
  }).shape,
});

export const updateMilkBagSchema = milkBagSchema.omit({
  donor: true,
  status: true,
  code: true,
});

export type MilkBagSchema = z.infer<typeof milkBagSchema>;

export type MilkBagCreateSchema = z.infer<typeof createMilkBagSchema>;
