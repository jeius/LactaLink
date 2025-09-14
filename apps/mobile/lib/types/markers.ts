import { Collection } from '@lactalink/types/collections';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { MarkKeyRequired } from '@lactalink/types/utils';
import { SpatialSearch } from '@lactalink/utilities/spatial-search';
import type { MarkerPressEvent as RNMarkerPressEvent } from 'react-native-maps';
import { MapMarker, MapMarkerProps as RNMarkerProps } from 'react-native-maps';

export type MarkerPressEvent = RNMarkerPressEvent & { identifier: string };

export type MarkerDataSlug = Extract<
  CollectionSlug,
  'donations' | 'requests' | 'hospitals' | 'milkBanks'
>;

export type MapMarkerProps = MarkKeyRequired<RNMarkerProps, 'identifier'>;

export type MarkerData<TSlug extends MarkerDataSlug = MarkerDataSlug> = {
  slug: TSlug;
  data: Collection<TSlug>;
  deliveryPreference: DeliveryPreference | null;
  marker: MapMarkerProps;
  markerRef?: MapMarker | null;
};

export interface MarkersStoreState<TSlug extends MarkerDataSlug = MarkerDataSlug> {
  markerMap: Map<string, MarkerData<TSlug>>;
  markersIndex: SpatialSearch<MapMarkerProps>;
  selectedMarker: MarkerData<TSlug> | null;
}
