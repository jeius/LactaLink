import type {
  CollectionSlug as PayloadCollectionSlug,
  PopulateType,
  UploadCollectionSlug,
} from '@/payload-types';
import type { Config, Donation, Image, Individual, Like } from '@/payload-types/generated';

export type CollectionSlug = PayloadCollectionSlug;
export type Collections = Config['collections'][keyof Config['collections']];

type CollectionBySlug<TSlug extends CollectionSlug> = Config['collections'][TSlug];

export type CollectionsJoins = Config['collectionsJoins'];

export type Collection<TSlug extends CollectionSlug | unknown = unknown> =
  TSlug extends CollectionSlug ? CollectionBySlug<TSlug> : Collections;

export type CollectionWithOwner = Extract<Collection, Pick<Individual, 'owner'>>;

export type CollectionWithCreatedBy = Extract<Collection, Pick<Donation, 'createdBy'>>;

export type CollectionWithCreatedByProfile = Extract<Collection, Pick<Like, 'createdBy'>>;

export type CollectionWithAvatar = Extract<Collection, Pick<Individual, 'avatar'>>;

export type CollectionWithBlurHash = Extract<Collection, Pick<Image, 'blurHash'>>;

export type FileCollectionSlug = UploadCollectionSlug;

export type FileCollection = Collection<FileCollectionSlug>;

export type CollectionOperation = 'CREATE' | 'FIND' | 'UPDATE' | 'DELETE';

export type Populate = PopulateType;
