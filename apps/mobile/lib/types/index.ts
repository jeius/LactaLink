import { SignInSchema, signInSchema } from '@lactalink/types/dist/forms/auth';

export * from './profile';

export const signUpSchema = signInSchema;
export type SignUpSchema = SignInSchema;

export type NativeFile = {
  uri: string;
  name: string;
  type: string;
};
