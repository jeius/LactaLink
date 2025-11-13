/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CollectionSlug,
  DataFromCollectionSlug,
  DataFromGlobalSlug,
  GlobalSlug,
  SelectFromCollectionSlug,
  TypedCollectionJoins,
  TypedCollectionSelect,
  TypeWithID,
  TypeWithTimestamps,
} from './config';
import type { Operator } from './constants';
export type { Operator };
export type JsonValue = JsonArray | JsonObject | unknown;
export type JsonArray = Array<JsonValue>;
export interface JsonObject {
  [key: string]: any;
}
export type WhereField = {
  [key in Operator]?: JsonValue;
};
export type Where = {
  [key: string]: Where[] | WhereField;
} & {
  and?: Where[];
  or?: Where[];
};
export type Sort = Array<string> | string;

export type Document = any;
export type Operation = 'create' | 'delete' | 'read' | 'update';
export type VersionOperations = 'readVersions';
export type AuthOperations = 'unlock';
export type AllOperations = AuthOperations | Operation | VersionOperations;
export declare function docHasTimestamps(doc: any): doc is TypeWithTimestamps;
export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
export type IsAny<T> = IfAny<T, true, false>;
export type ReplaceAny<T, DefaultType> = IsAny<T> extends true ? DefaultType : T;
export type SelectIncludeType = {
  [k: string]: SelectIncludeType | true;
};
export type SelectExcludeType = {
  [k: string]: false | SelectExcludeType;
};
export type SelectMode = 'exclude' | 'include';
export type SelectType = SelectExcludeType | SelectIncludeType;
export type ApplyDisableErrors<T, DisableErrors = false> = false extends DisableErrors
  ? T
  : null | T;
export type TransformDataWithSelect<
  Data extends Record<string, any>,
  Select extends SelectType,
> = Select extends never
  ? Data
  : string extends keyof Select
    ? Data
    : string extends keyof Omit<Data, 'id'>
      ? Select extends SelectIncludeType
        ? {
            [K in Data extends TypeWithID ? 'id' | keyof Select : keyof Select]: K extends 'id'
              ? number | string
              : unknown;
          }
        : Data
      : Select extends SelectIncludeType
        ? {
            [K in keyof Data as K extends keyof Select
              ? Select[K] extends object | true
                ? K
                : never
              : K extends 'id'
                ? K
                : never]: Data[K];
          }
        : {
            [K in keyof Data as K extends keyof Select
              ? Select[K] extends object | undefined
                ? K
                : never
              : K]: Data[K];
          };
export type TransformCollectionWithSelect<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug>,
> = TSelect extends SelectType
  ? TransformDataWithSelect<DataFromCollectionSlug<TSlug>, TSelect>
  : DataFromCollectionSlug<TSlug>;
export type TransformGlobalWithSelect<
  TSlug extends GlobalSlug,
  TSelect extends SelectType,
> = TSelect extends SelectType
  ? TransformDataWithSelect<DataFromGlobalSlug<TSlug>, TSelect>
  : DataFromGlobalSlug<TSlug>;
export type PopulateType = Partial<TypedCollectionSelect>;
export type ResolvedFilterOptions = {
  [collection: string]: Where;
};

/**
 * Applies pagination for join fields for including collection relationships
 */
export type JoinQuery<TSlug extends CollectionSlug = CollectionSlug> =
  TSlug extends keyof TypedCollectionJoins
    ? TypedCollectionJoins[TSlug] extends Record<string, string>
      ?
          | false
          | Partial<{
              [K in keyof TypedCollectionJoins[TSlug]]:
                | {
                    count?: boolean;
                    limit?: number;
                    page?: number;
                    sort?: string;
                    where?: Where;
                  }
                | false;
            }>
      : false
    : never;
