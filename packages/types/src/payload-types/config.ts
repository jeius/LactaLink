import { MarkOptional, NonNever } from '../utils';
import { JsonObject, TransformCollectionWithSelect } from './collection';
import { Config as GeneratedTypes } from './generated';

type ResolveCollectionType<T> = 'collections' extends keyof T ? T['collections'] : never;
type ResolveBlockType<T> = 'blocks' extends keyof T ? T['blocks'] : never;
type ResolveCollectionSelectType<T> = 'collectionsSelect' extends keyof T
  ? T['collectionsSelect']
  : never;
type ResolveCollectionJoinsType<T> = 'collectionsJoins' extends keyof T
  ? T['collectionsJoins']
  : never;
type ResolveGlobalType<T> = 'globals' extends keyof T ? T['globals'] : never;
type ResolveGlobalSelectType<T> = 'globalsSelect' extends keyof T ? T['globalsSelect'] : never;
export type TypedCollection = ResolveCollectionType<GeneratedTypes>;
export type TypedBlock = ResolveBlockType<GeneratedTypes>;
export type TypedUploadCollection = NonNever<{
  [K in keyof TypedCollection]:
    | 'filename'
    | 'filesize'
    | 'mimeType'
    | 'url' extends keyof TypedCollection[K]
    ? TypedCollection[K]
    : never;
}>;
export type TypedCollectionSelect = ResolveCollectionSelectType<GeneratedTypes>;
export type TypedCollectionJoins = ResolveCollectionJoinsType<GeneratedTypes>;
export type TypedGlobal = ResolveGlobalType<GeneratedTypes>;
export type TypedGlobalSelect = ResolveGlobalSelectType<GeneratedTypes>;
export type StringKeyOf<T> = Extract<keyof T, string>;
export type CollectionSlug = StringKeyOf<TypedCollection>;
export type BlockSlug = StringKeyOf<TypedBlock>;
export type UploadCollectionSlug = StringKeyOf<TypedUploadCollection>;
type ResolveDbType<T> = 'db' extends keyof T ? T['db'] : never;
export type DefaultDocumentIDType = ResolveDbType<GeneratedTypes>['defaultIDType'];
export type GlobalSlug = StringKeyOf<TypedGlobal>;
type ResolveLocaleType<T> = 'locale' extends keyof T ? T['locale'] : never;
type ResolveUserType<T> = 'user' extends keyof T ? T['user'] : never;
export type TypedLocale = ResolveLocaleType<GeneratedTypes>;
export type TypedUser = ResolveUserType<GeneratedTypes>;
type ResolveAuthOperationsType<T> = 'auth' extends keyof T ? T['auth'] : never;
export type TypedAuthOperations = ResolveAuthOperationsType<GeneratedTypes>;
type ResolveJobOperationsType<T> = 'jobs' extends keyof T ? T['jobs'] : never;
export type TypedJobs = ResolveJobOperationsType<GeneratedTypes>;
export type DataFromGlobalSlug<TSlug extends GlobalSlug> = TypedGlobal[TSlug];
export type DataFromCollectionSlug<TSlug extends CollectionSlug> = TypedCollection[TSlug];
export type SelectFromCollectionSlug<TSlug extends CollectionSlug> = TypedCollectionSelect[TSlug];

export type RequiredDataFromCollection<TData extends JsonObject> = MarkOptional<
  TData,
  'createdAt' | 'id' | 'sizes' | 'updatedAt'
>;
export type RequiredDataFromCollectionSlug<TSlug extends CollectionSlug> =
  RequiredDataFromCollection<DataFromCollectionSlug<TSlug>>;

export type BulkOperationResult<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
> = {
  docs: TransformCollectionWithSelect<TSlug, TSelect>[];
  errors: {
    id: DataFromCollectionSlug<TSlug>['id'];
    message: string;
  }[];
};
export type TypeWithID = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  docId?: any;
  id: number | string;
};
export type TypeWithTimestamps = {
  [key: string]: unknown;
  createdAt: string;
  id: number | string;
  updatedAt: string;
};
