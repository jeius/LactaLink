import z from 'zod';
import { widthSchema } from './widthSchema';

export const textareaBlockSchema = z.object({
  blockType: z.literal('textarea'),
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

export type TextareaBlockSchema = z.infer<typeof textareaBlockSchema>;
