import React from 'react';

import { MapView } from '@/components/map/MapView';

export default function MapPage() {
  // if (Platform.OS === 'android') {
  //   return <GoogleMapView />;
  // }

  // if (Platform.OS === 'ios') {
  //   return <AppleMapView />;
  // }

  return <MapView />;
}
