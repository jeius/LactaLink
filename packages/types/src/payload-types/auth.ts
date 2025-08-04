import { Where } from './collection';
import type { CollectionSlug, GlobalSlug } from './config';
import { User } from './generated';
/**
 * A permission object that can be used to determine if a user has access to a specific operation.
 */
export type Permission = {
  permission: boolean;
  where?: Where;
};
export type FieldsPermissions = {
  [fieldName: string]: FieldPermissions;
};
export type BlockPermissions = {
  create: Permission;
  fields: FieldsPermissions;
  read: Permission;
  update: Permission;
};
export type SanitizedBlockPermissions =
  | {
      fields: SanitizedFieldsPermissions;
    }
  | true;
export type BlocksPermissions = {
  [blockSlug: string]: BlockPermissions;
};
export type SanitizedBlocksPermissions =
  | {
      [blockSlug: string]: SanitizedBlockPermissions;
    }
  | true;
export type FieldPermissions = {
  blocks?: BlocksPermissions;
  create: Permission;
  fields?: FieldsPermissions;
  read: Permission;
  update: Permission;
};
export type SanitizedFieldPermissions =
  | {
      blocks?: SanitizedBlocksPermissions;
      create: true;
      fields?: SanitizedFieldsPermissions;
      read: true;
      update: true;
    }
  | true;
export type SanitizedFieldsPermissions =
  | {
      [fieldName: string]: SanitizedFieldPermissions;
    }
  | true;
export type CollectionPermission = {
  create: Permission;
  delete: Permission;
  fields: FieldsPermissions;
  read: Permission;
  readVersions?: Permission;
  update: Permission;
};
export type SanitizedCollectionPermission = {
  create?: true;
  delete?: true;
  fields: SanitizedFieldsPermissions;
  read?: true;
  readVersions?: true;
  update?: true;
};
export type GlobalPermission = {
  fields: FieldsPermissions;
  read: Permission;
  readVersions?: Permission;
  update: Permission;
};
export type SanitizedGlobalPermission = {
  fields: SanitizedFieldsPermissions;
  read?: true;
  readVersions?: true;
  update?: true;
};
export type DocumentPermissions = CollectionPermission | GlobalPermission;
export type SanitizedDocumentPermissions =
  | SanitizedCollectionPermission
  | SanitizedGlobalPermission;
export type Permissions = {
  canAccessAdmin: boolean;
  collections?: Record<CollectionSlug, CollectionPermission>;
  globals?: Record<GlobalSlug, GlobalPermission>;
};
export type SanitizedPermissions = {
  canAccessAdmin?: boolean;
  collections?: {
    [collectionSlug: string]: SanitizedCollectionPermission;
  };
  globals?: {
    [globalSlug: string]: SanitizedGlobalPermission;
  };
};
type BaseUser = {
  collection: string;
  email?: string;
  id: number | string;
  username?: string;
};
export type AuthUser = {
  [key: string]: any;
} & BaseUser;

export type AuthStrategyResult = {
  responseHeaders?: Headers;
  user:
    | ({
        _strategy?: string;
        collection?: string;
      } & User)
    | null;
};

export type LoginWithUsernameOptions =
  | {
      allowEmailLogin?: false;
      requireEmail?: boolean;
      requireUsername?: true;
    }
  | {
      allowEmailLogin?: true;
      requireEmail?: boolean;
      requireUsername?: boolean;
    };

export declare function hasWhereAccessResult(result: boolean | Where): result is Where;
