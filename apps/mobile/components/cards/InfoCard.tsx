import { DeliveryPreference } from '@lactalink/types';
import React from 'react';
import MapView, { LatLng } from 'react-native-maps';
import { MapBottomSheetProps } from '../map/MapBottomSheet';
import { VStack } from '../ui/vstack';
import { DeliveryPreferencesCard } from './DeliveryPreferencesCard';
import { DonationInfoCard } from './DonationInfoCard';
import { RequestInfoCard } from './RequestInfoCard';

interface InfoCardProps {
  selected: MapBottomSheetProps['value'];
  mapRef?: React.RefObject<MapView | null>;
}

export default function InfoCard({ selected, mapRef }: InfoCardProps) {
  if (!selected) return null;

  const { slug, data } = selected;

  function handleViewOnMap(latlng: LatLng) {
    if (mapRef?.current) {
      mapRef.current.animateCamera({
        center: latlng,
      });
    }
  }

  if (slug === 'donations') {
    return (
      <VStack space="lg" className="w-full items-center">
        <DonationInfoCard data={data} />
        <DeliveryPreferencesCard
          preferences={data.deliveryDetails as DeliveryPreference[]}
          onViewOnMap={handleViewOnMap}
        />
      </VStack>
    );
  }

  if (slug === 'requests') {
    return (
      <VStack space="lg" className="w-full items-center">
        <RequestInfoCard data={data} />
        <DeliveryPreferencesCard
          preferences={data.deliveryDetails as DeliveryPreference[]}
          onViewOnMap={handleViewOnMap}
        />
      </VStack>
    );
  }
  return null;
}
