import { signInSchema } from '@lactalink/types';
import { z } from 'zod';

export const signUpSchema = signInSchema;

export type SignUpSchema = z.infer<typeof signUpSchema>;
