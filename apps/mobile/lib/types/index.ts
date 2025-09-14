import { Stack } from 'expo-router';

export * from './assets';
export * from './markers';
export * from './profile';

export type NativeFile = {
  uri: string;
  name: string;
  type: string;
};

export type StackScreenOptions = Parameters<typeof Stack.Screen>[number]['options'];

export type MapPageSearchParams = { markerID?: string };
