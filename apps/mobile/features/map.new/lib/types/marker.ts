import { BoundarySchema } from '@lactalink/form-schemas/geocoding';
import { MarkerType } from '@lactalink/types';
import { MapMarker } from '@lactalink/types/api';
import { Collection } from '@lactalink/types/collections';
import { PropsWithChildren } from 'react';
import { RNMarker } from 'react-native-google-maps-plus';

/** The four collection types that can appear as map markers. */
export type DataMarkerSlug = MarkerType;

/**
 * A lightweight data marker that pairs the rendered map pin with the minimal
 * marker payload returned by the `/api/map-markers` endpoint.
 *
 * Unlike the legacy `DataMarker`, this does not hold the full Payload document.
 * Full document data is fetched on demand when the user taps a marker.
 */
export type DataMarker = {
  /** The renderable map pin. */
  marker: RNMarker;
  /** Lightweight payload returned by the endpoint. */
  data: MapMarker;
};

export type Data<T extends DataMarkerSlug = DataMarkerSlug> = {
  relationTo: T;
  value: Collection<T>;
};

export interface DataMarkerStore {
  markersMap: Map<string, DataMarker>;
  markers: RNMarker[];
  selectedDataMarker: DataMarker | null;
  isPending: boolean;
  actions: {
    addMarker: (marker: DataMarker) => void;
    removeMarker: (markerID: string) => void;
    setSelectedMarker: (markerID: string | null) => void;
  };
}

export interface DataMarkerProviderProps extends PropsWithChildren {
  selectedMarkerID?: string | null;
  boundary?: BoundarySchema | null;
}
