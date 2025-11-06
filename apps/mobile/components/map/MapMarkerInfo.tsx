import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { validatePoint } from '@lactalink/utilities/geo-utils';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import { MapIcon } from 'lucide-react-native';
import React from 'react';
import { DeliveryPreferenceCard, DonationInfoCard, RequestInfoCard } from '../cards';
import { createMarkerID, useSelectedDataMarker } from '../contexts/DataMarkerProvider';
import { useMap } from '../contexts/MapProvider';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface MapMarkerInfoProps {
  onViewOnMap?: (data: DeliveryPreference) => void;
}

export function MapMarkerInfo({ onViewOnMap }: MapMarkerInfoProps) {
  const [map] = useMap();
  const [selectedMarker, setSelectedMarker] = useSelectedDataMarker();

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
        map?.setCamera({ center: { latitude, longitude }, zoom: 16 }, true, 300);
        setTimeout(() => map?.showMarkerInfoWindow(markerID), 350);
      }

      return (
        <Card key={i} className="w-full">
          <VStack space="lg" className="items-end">
            <DeliveryPreferenceCard preference={preference} variant="ghost" className="p-0" />

            <Button size="sm" variant="outline" onPress={handleViewOnMap}>
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
      <VStack space="sm" className="mb-10 w-full items-stretch">
        <Text className="font-JakartaSemiBold">Donation Details</Text>
        <DonationInfoCard data={data} />
        <Text className="mt-4 font-JakartaSemiBold">Delivery Preferences</Text>
        <DeliveryPreferencesCard slug="donations" data={preferences} />
      </VStack>
    );
  }

  if (isRequest(data)) {
    const preferences = extractCollection(data.deliveryPreferences) || [];
    return (
      <VStack space="sm" className="mb-10 w-full items-stretch">
        <Text className="font-JakartaSemiBold">Request Details</Text>
        <RequestInfoCard data={data} />
        <Text className="mt-4 font-JakartaSemiBold">Delivery Preferences</Text>
        <DeliveryPreferencesCard slug="requests" data={preferences} />
      </VStack>
    );
  }
  return null;
}
