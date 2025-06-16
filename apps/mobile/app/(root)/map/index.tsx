import SafeArea from '@/components/SafeArea';
import { Text } from '@/components/ui/text';

import React from 'react';
import { Platform } from 'react-native';

import AppleMapView from '@/components/map-views/AppleMapView';
import { GoogleMapView } from '@/components/map-views/GoogleMapView';

export default function MapPage() {
  if (Platform.OS === 'android') {
    return <GoogleMapView />;
  }

  if (Platform.OS === 'ios') {
    return <AppleMapView />;
  }

  return (
    <SafeArea className="items-center justify-center">
      <Text>Unsupported Platform {Platform.OS}</Text>
    </SafeArea>
  );
}
