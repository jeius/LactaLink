import { PaginatedDocs } from '@lactalink/types/payload-types';
import { InfiniteData } from '@tanstack/react-query';
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

export type MapPageSearchParams = {
  mrk?: string;
  lat?: string;
  lng?: string;
  title?: string;
};

export type InfiniteDataMap<T, V = number> = InfiniteData<
  { docs: Map<string, T> } & Omit<PaginatedDocs, 'docs'>,
  V
>;

export type InfiniteDoc<T, V = number> = InfiniteData<PaginatedDocs<T>, V>;
