import { Collection, User } from '@lactalink/types';

export * from './environment';
export * from './payload-types';

export type CollectionWithOwner = Extract<
  Collection,
  {
    owner?: string | User | null;
  }
>;

export type CollectionWithCreatedBy = Extract<
  Collection,
  {
    createdBy?: string | User | null;
  }
>;
