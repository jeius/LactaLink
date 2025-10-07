import * as z from 'zod';
import { emptyTransform } from './transformers';

export const textAreaSchema = z
  .string()
  .max(500, 'Max length 500 characters')
  .transform(emptyTransform)
  .optional();
