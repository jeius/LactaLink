import { Collection } from '@lactalink/types/collections';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { PropsWithChildren } from 'react';
import { RNMarker } from 'react-native-google-maps-plus';

export type DataMarkerSlug = Extract<
  CollectionSlug,
  'donations' | 'requests' | 'hospitals' | 'milkBanks'
>;

export type Data<T extends DataMarkerSlug = DataMarkerSlug> = {
  relationTo: T;
  value: Collection<T>;
};

export type DataMarker = {
  data: Data;
  marker: RNMarker;
  deliveryPreference: DeliveryPreference | null;
};

export interface DataMarkerStore {
  markersMap: Map<string, DataMarker>;
  markers: RNMarker[];
  selectedDataMarker: DataMarker | null;
  actions: {
    addMarker: (doc: Collection<DataMarkerSlug>) => DataMarker | null | DataMarker[];
    removeMarker: (markerID: string) => void;
    setSelectedMarker: (markerID: string | null) => void;
  };
}

export interface DataMarkerProviderProps extends PropsWithChildren {
  selectedMarkerID?: string | null;
}
