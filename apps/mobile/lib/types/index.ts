import { SignInSchema, signInSchema } from '@lactalink/types';
import { Stack } from 'expo-router';

export * from './assets';
export * from './profile';

export const signUpSchema = signInSchema;
export type SignUpSchema = SignInSchema;

export type NativeFile = {
  uri: string;
  name: string;
  type: string;
};

export type StackScreenOptions = Parameters<typeof Stack.Screen>[number]['options'];
