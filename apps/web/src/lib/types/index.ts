import { Operation, PayloadRequest, SanitizedCollectionConfig } from 'payload';

export type { CollectionWithCreatedBy, CollectionWithOwner } from '@lactalink/types/collections';

export type AfterChangeHookParams<T> = {
  doc: T;
  previousDoc: T;
  req: PayloadRequest;
  operation: Extract<Operation, 'create' | 'update'>;
  collection: SanitizedCollectionConfig;
};
