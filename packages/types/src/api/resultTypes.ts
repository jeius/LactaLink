import { CollectionSlug } from '@/collections';
import { Polyline } from '@/geo-types';
import type {
  BulkOperationResult,
  PaginatedDocs,
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
} from '@/payload-types';
import { Donation, Request, Transaction } from '@/payload-types/generated';

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

export type DonationCreateResult = {
  donation: Donation;
  transaction: Transaction | null;
};

export type RequestCreateResult = {
  request: Request;
  transaction: Transaction | null;
};

/** A single map marker returned by the `GET /api/map-markers` endpoint. */
export type MapMarker = {
  /** The document ID of the related collection record. */
  id: string;
  /** Which collection this marker belongs to. */
  type: 'donations' | 'requests' | 'hospitals' | 'milkBanks';
  /** Geographic coordinate of the marker. */
  coordinate: { latitude: number; longitude: number };
  /** Primary display text for the marker callout. */
  title: string;
  /** Secondary display text for the marker callout. */
  snippet?: string;
  /**
   * Present only for `donations` and `requests` markers. References the specific
   * delivery preference that resolves to this coordinate, so the mobile tap handler
   * can load the correct delivery preference details.
   */
  deliveryPreferenceId?: string;
};

export type MapMarkersResult = MapMarker[];
