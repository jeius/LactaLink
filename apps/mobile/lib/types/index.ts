import { SignInSchema, signInSchema } from '@lactalink/types';

export * from './assets';
export * from './profile';

export const signUpSchema = signInSchema;
export type SignUpSchema = SignInSchema;

export type NativeFile = {
  uri: string;
  name: string;
  type: string;
};
