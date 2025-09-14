import { useMapStore } from '@/lib/stores/mapStore';
import { createMarkerID, setSelectedMarker, useMarkersStore } from '@/lib/stores/markersStore';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { validatePoint } from '@lactalink/utilities/geo-utils';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import { MapIcon } from 'lucide-react-native';
import React from 'react';
import { DeliveryPreferenceCard, DonationInfoCard, RequestInfoCard } from '../cards';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { VStack } from '../ui/vstack';

interface MapMarkerInfoProps {
  onViewOnMap?: (data: DeliveryPreference) => void;
}

export function MapMarkerInfo({ onViewOnMap }: MapMarkerInfoProps) {
  const map = useMapStore((s) => s.map);
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
      async function handleViewOnMap() {
        onViewOnMap?.(preference);

        const point = extractCollection(preference.address)?.coordinates;
        if (!validatePoint(point)) return;

        const [longitude, latitude] = point;
        const markerID = createMarkerID(slug, data.id, point);
        setSelectedMarker(markerID);

        if (map) {
          const currentCamera = await map.getCamera();
          map.animateCamera({
            center: { latitude, longitude },
            zoom: Math.max(currentCamera.zoom || 16, 16),
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
