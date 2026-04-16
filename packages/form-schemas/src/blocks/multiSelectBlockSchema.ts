import z from 'zod';
import { optionSchema } from './optionSchema';
import { widthSchema } from './widthSchema';

export const multiSelectBlockSchema = z.object({
  blockType: z.literal('multi-select'),
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
  options: z.array(optionSchema),
  withDynamicOption: z.boolean().nullish(),
  dynamicOptionLabel: z.string().nullish(),
  dynamicOptionPlaceholder: z.string().nullish(),
});

export type MultiSelectBlockSchema = z.infer<typeof multiSelectBlockSchema>;
