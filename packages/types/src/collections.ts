import type { CollectionSlug as SlugsFromPayload, Where as WherePayload } from 'payload';
import { Config } from './payload-types';

export type Collections = Config['collections'][keyof Config['collections']];
export type HasNameCollection<T> = T extends { name: string } ? T : never;

export type CollectionSlug = SlugsFromPayload;
export type HasNameCollectionSlug = Omit<
  CollectionSlug,
  'users' | 'payload-locked-documents' | 'payload-preferences' | 'payload-migrations' | 'avatars'
>;

export type Where = WherePayload;
