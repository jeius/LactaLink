import type {
  CollectionSlug as PayloadCollectionSlug,
  UploadCollectionSlug as PayloadUploadCollectionSlug,
} from 'payload';
import { Config } from './generated';

export type { SelectFromCollectionSlug } from 'node_modules/payload/dist/collections/config/types';
export type { TransformCollectionWithSelect } from 'node_modules/payload/dist/types';
export type * from 'payload';

export type CollectionSlug = PayloadCollectionSlug<Config>;
export type UploadCollectionSlug = PayloadUploadCollectionSlug<Config>;
