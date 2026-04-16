import z from 'zod';

export const optionSchema = z.object({
  value: z.string('Value is required'),
  label: z.string('Label is required'),
  id: z.string().nullish(),
});

export type OptionSchema = z.infer<typeof optionSchema>;
