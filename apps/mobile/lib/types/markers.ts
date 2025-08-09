import { DeliveryPreference, Donation, Request } from '@lactalink/types';
import type { MapMarkerProps } from 'react-native-maps';

export type MarkerDeliveryDetails<TData extends Donation | Request> = {
  data: TData;
  deliveryPreference: Omit<DeliveryPreference, 'requests' | 'donors'>;
};

export type MarkerDetails<TData extends Donation | Request> = MapMarkerProps &
  MarkerDeliveryDetails<TData>;

export type MarkerPressEvent<TData extends Donation | Request> = MarkerDeliveryDetails<TData> &
  Pick<MapMarkerProps, 'identifier' | 'coordinate' | 'title' | 'description' | 'id'>;
