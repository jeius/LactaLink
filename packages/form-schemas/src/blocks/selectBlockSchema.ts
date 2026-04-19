import z from 'zod';
import { optionSchema } from './optionSchema';
import { widthSchema } from './widthSchema';

export const selectBlockSchema = z
  .object({
    blockType: z.literal('select'),
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
    options: z.array(optionSchema).min(1, 'At least one option is required'),
    withDynamicOption: z.boolean().nullish(),
    dynamicOptionLabel: z.string().nullish(),
    dynamicOptionPlaceholder: z.string().nullish(),
  })
  .refine(
    (data) => {
      if (data.withDynamicOption) {
        return !!data.dynamicOptionLabel;
      }
      return true;
    },
    {
      message: 'Dynamic option label is required!',
      path: ['dynamicOptionLabel'],
    }
  );

export type SelectBlockSchema = z.infer<typeof selectBlockSchema>;
