import { Collection, User } from '@lactalink/types';
import { DELIVERY_OPTIONS } from '../constants';

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

export type DeliveryMode = (typeof DELIVERY_OPTIONS)[keyof typeof DELIVERY_OPTIONS]['value'];
