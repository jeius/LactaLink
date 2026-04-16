import { z } from 'zod';
import { checkboxBlockSchema } from './checkboxBlockSchema';
import { dateBlockSchema } from './dateBlockSchema';
import { emailBlockSchema } from './emailBlockSchema';
import { messageBlockSchema } from './messageBlockSchema';
import { multiSelectBlockSchema } from './multiSelectBlockSchema';
import { numberBlockSchema } from './numberBlockSchema';
import { radioBlockSchema } from './radioBlockSchema';
import { selectBlockSchema } from './selectBlockSchema';
import { textareaBlockSchema } from './textareaBlockSchema';
import { textBlockSchema } from './textBlockSchema';

export * from './checkboxBlockSchema';
export * from './dateBlockSchema';
export * from './emailBlockSchema';
export * from './messageBlockSchema';
export * from './multiSelectBlockSchema';
export * from './numberBlockSchema';
export * from './optionSchema';
export * from './radioBlockSchema';
export * from './selectBlockSchema';
export * from './textareaBlockSchema';
export * from './textBlockSchema';
export * from './widthSchema';

export const blockSchema = z.discriminatedUnion('blockType', [
  checkboxBlockSchema,
  dateBlockSchema,
  emailBlockSchema,
  messageBlockSchema,
  multiSelectBlockSchema,
  numberBlockSchema,
  radioBlockSchema,
  selectBlockSchema,
  textareaBlockSchema,
  textBlockSchema,
]);

export type BlockSchema = z.infer<typeof blockSchema>;
