import {
  CollectionSlug,
  DeliveryPreference,
  Donation,
  Hospital,
  MilkBank,
  Request,
} from '@lactalink/types';
import React from 'react';
import MapView, { LatLng } from 'react-native-maps';
import { VStack } from '../ui/vstack';
import { DeliveryPreferencesCard } from './DeliveryPreferencesCard';
import { DonationInfoCard } from './DonationInfoCard';
import { RequestInfoCard } from './RequestInfoCard';

interface InfoCardProps {
  data: Donation | Request | Hospital | MilkBank | { id: string };
  slug: Extract<CollectionSlug, 'donations' | 'requests' | 'hospitals' | 'milkBanks'>;
  mapRef?: React.RefObject<MapView | null>;
}

export default function InfoCard({ data, slug, mapRef }: InfoCardProps) {
  function handleViewOnMap(latlng: LatLng) {
    if (mapRef?.current) {
      mapRef.current.animateCamera({
        center: latlng,
      });
    }
  }

  if (slug === 'donations') {
    const donationData = data as Donation;
    return (
      <VStack space="lg" className="w-full items-center">
        <DonationInfoCard data={donationData} />
        <DeliveryPreferencesCard
          preferences={donationData.deliveryDetails as DeliveryPreference[]}
          onViewOnMap={handleViewOnMap}
        />
      </VStack>
    );
  }

  if (slug === 'requests') {
    const requestData = data as Request;
    return (
      <VStack space="lg" className="w-full items-center">
        <RequestInfoCard data={requestData} />
        <DeliveryPreferencesCard
          preferences={requestData.deliveryDetails as DeliveryPreference[]}
          onViewOnMap={handleViewOnMap}
        />
      </VStack>
    );
  }
  return null;
}
