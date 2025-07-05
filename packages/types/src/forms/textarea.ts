import * as z from 'zod/v4';
import { emptyTransform } from './transformers';

export const textAreaSchema = z
  .string()
  .max(500, 'Max length 500 characters')
  .transform(emptyTransform)
  .optional();
