import { createMarkerID, setSelectedMarker, useMarkersStore } from '@/lib/stores/markersStore';
import { CollectionSlug, DeliveryPreference } from '@lactalink/types';
import { extractCollection, isDonation, isRequest, validatePoint } from '@lactalink/utilities';
import { MapIcon } from 'lucide-react-native';
import React from 'react';
import { DeliveryPreferenceCard, DonationInfoCard, RequestInfoCard } from '../cards';
import { useMap } from '../contexts/MapProvider';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { VStack } from '../ui/vstack';

interface MapMarkerInfoProps {
  onViewOnMap?: (data: DeliveryPreference) => void;
}

export function MapMarkerInfo({ onViewOnMap }: MapMarkerInfoProps) {
  const { mapRef } = useMap();
  const selectedMarker = useMarkersStore((s) => s.selectedMarker);

  if (!selectedMarker) return null;

  const { data } = selectedMarker;

  function DeliveryPreferencesCard({
    data: prefs,
    slug,
  }: {
    data: DeliveryPreference[];
    slug: Extract<CollectionSlug, 'donations' | 'requests'>;
  }) {
    return prefs.map((preference, i) => {
      function handleViewOnMap() {
        onViewOnMap?.(preference);

        const point = extractCollection(preference.address)?.coordinates;
        if (!validatePoint(point)) return;

        const [longitude, latitude] = point;
        const markerID = createMarkerID(slug, data.id, point);
        setSelectedMarker(markerID);

        if (mapRef?.current) {
          mapRef.current.animateCamera({
            center: { latitude, longitude },
          });
        }
      }

      return (
        <Card key={i} className="w-full">
          <VStack space="lg">
            <DeliveryPreferenceCard preference={preference} variant="ghost" className="p-0" />

            <Button size="md" onPress={handleViewOnMap}>
              <ButtonIcon as={MapIcon} />
              <ButtonText>View on Map</ButtonText>
            </Button>
          </VStack>
        </Card>
      );
    });
  }

  if (isDonation(data)) {
    const preferences = extractCollection(data.deliveryPreferences) || [];
    return (
      <VStack space="lg" className="w-full items-center">
        <DonationInfoCard data={data} />
        <DeliveryPreferencesCard slug="donations" data={preferences} />
      </VStack>
    );
  }

  if (isRequest(data)) {
    const preferences = extractCollection(data.deliveryPreferences) || [];
    return (
      <VStack space="lg" className="w-full items-center">
        <RequestInfoCard data={data} />
        <DeliveryPreferencesCard slug="requests" data={preferences} />
      </VStack>
    );
  }
  return null;
}
