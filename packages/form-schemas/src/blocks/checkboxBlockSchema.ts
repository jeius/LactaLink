import z from 'zod';
import { widthSchema } from './widthSchema';

export const checkboxBlockSchema = z.object({
  blockType: z.literal('checkbox'),
  blockName: z.string().nullish(),
  id: z.string().nullish(),
  name: z.string('Name is required'),
  label: z.string('Label is required'),
  helperText: z.string().nullish(),
  required: z.boolean().nullish(),
  defaultValue: z.boolean().nullish(),
  hidden: z.boolean().nullish(),
  width: widthSchema.nullish(),
});

export type CheckboxBlockSchema = z.infer<typeof checkboxBlockSchema>;
