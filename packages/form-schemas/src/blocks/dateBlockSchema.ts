import z from 'zod';
import { widthSchema } from './widthSchema';

export const dateBlockSchema = z.object({
  blockType: z.literal('date'),
  blockName: z.string().nullish(),
  id: z.string().nullish(),
  name: z.string('Name is required'),
  label: z.string('Label is required'),
  placeholder: z.string().nullish(),
  helperText: z.string().nullish(),
  required: z.boolean().nullish(),
  defaultValue: z.string().nullish(),
  hidden: z.boolean().nullish(),
  width: widthSchema.nullish(),
});

export type DateBlockSchema = z.infer<typeof dateBlockSchema>;
