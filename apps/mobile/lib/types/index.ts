import { PaginatedDocs } from '@lactalink/types/payload-types';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { InfiniteData } from '@tanstack/react-query';
import { Stack } from 'expo-router';

export * from './assets';
export * from './markers';
export * from './profile';
export type { MapPageSearchParams } from './searchParams';

export type NativeFile = {
  uri: string;
  name: string;
  type: string;
};

export type StackScreenOptions = Parameters<typeof Stack.Screen>[number]['options'];

export type InfiniteDataMap<T, V = unknown> = InfiniteData<
  { docs: Map<string, T> } & Omit<PaginatedDocs, 'docs'>,
  V
>;

export type InfiniteDoc<T, V = unknown> = InfiniteData<PaginatedDocs<T>, V>;

export type ListRenderItem<T> = (
  info: ListRenderItemInfo<T> & { isPlaceholder: boolean }
) => React.ReactElement | null;
