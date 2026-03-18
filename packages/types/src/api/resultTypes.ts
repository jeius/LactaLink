import { CollectionSlug } from '@/collections';
import { Polyline } from '@/geo-types';
import type {
  BulkOperationResult,
  PaginatedDocs,
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
} from '@/payload-types';

export type CreateResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  message: string;
  //@ts-expect-error - Payload type issue
  doc: TransformCollectionWithSelect<TSlug, TSelect>;
};

export type FindOneResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  //@ts-expect-error - Payload type issue
> = TransformCollectionWithSelect<TSlug, TSelect>;

export type FindManyResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> = TPaginate extends true
  ? //@ts-expect-error - Payload type issue
    PaginatedDocs<TransformCollectionWithSelect<TSlug, TSelect>>
  : //@ts-expect-error - Payload type issue
    TransformCollectionWithSelect<TSlug, TSelect>[];

export type UpdateByIDResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  //@ts-expect-error - Payload type issue
  doc: TransformCollectionWithSelect<TSlug, TSelect>;
  message: string;
};

export type UpdateManyResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  //@ts-expect-error - Payload type issue
> = BulkOperationResult<TSlug, TSelect>;

export type DeleteByIDResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  //@ts-expect-error - Payload type issue
  doc: TransformCollectionWithSelect<TSlug, TSelect>;
  message: string;
};

export type DeleteManyResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  //@ts-expect-error - Payload type issue
> = BulkOperationResult<TSlug, TSelect>;

export type Direction = {
  description?: string | null;
  distanceMeters: number;
  duration: { seconds: number };
  polyline: Polyline;
  optimizedIntermediateWaypointIndex?: number[] | null;
  localizedValues: {
    distance?: string | null;
    duration?: string | null;
  };
};

export type DirectionsResult = Direction[] | null;
