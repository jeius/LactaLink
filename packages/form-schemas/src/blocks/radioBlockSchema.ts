import z from 'zod';
import { optionSchema } from './optionSchema';
import { widthSchema } from './widthSchema';

export const radioBlockSchema = z.object({
  blockType: z.literal('radio'),
  blockName: z.string().nullish(),
  id: z.string().nullish(),
  name: z.string('Name is required'),
  label: z.string('Label is required'),
  helperText: z.string().nullish(),
  required: z.boolean().nullish(),
  defaultValue: z.string().nullish(),
  hidden: z.boolean().nullish(),
  width: widthSchema.nullish(),
  options: z.array(optionSchema),
});

export type RadioBlockSchema = z.infer<typeof radioBlockSchema>;
