import type { PopulateType } from '../payload-types/collection';
import type { CollectionSlug, UploadCollectionSlug } from '../payload-types/config';
import type { Config, Donation, Image, Individual, Like } from '../payload-types/generated';

export type Collections = Config['collections'][keyof Config['collections']];

type CollectionBySlug<Slug extends CollectionSlug> = Config['collections'][Slug];

export type CollectionsJoins = Config['collectionsJoins'];

export type Collection<Slug extends CollectionSlug | unknown = unknown> =
  Slug extends CollectionSlug ? CollectionBySlug<Slug> : Collections;

export type CollectionWithOwner = Extract<Collection, Pick<Individual, 'owner'>>;

export type CollectionWithCreatedBy = Extract<Collection, Pick<Donation, 'createdBy'>>;

export type CollectionWithCreatedByProfile = Extract<Collection, Pick<Like, 'createdBy'>>;

export type CollectionWithAvatar = Extract<Collection, Pick<Individual, 'avatar'>>;

export type CollectionWithBlurHash = Extract<Collection, Pick<Image, 'blurHash'>>;

export type FileCollectionSlug = UploadCollectionSlug;

export type FileCollection = Collection<FileCollectionSlug>;

export type CollectionOperation = 'CREATE' | 'FIND' | 'UPDATE' | 'DELETE';

export type Populate = PopulateType;
