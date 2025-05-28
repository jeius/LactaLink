import { signInSchema } from '@lactalink/types';
import { z } from 'zod';

export * from './profile';

export const signUpSchema = signInSchema;
export type SignUpSchema = z.infer<typeof signUpSchema>;

export type NativeFile = {
  uri: string;
  name: string;
  type: string;
};
