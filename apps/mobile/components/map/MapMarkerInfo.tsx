import { Address, DeliveryPreference } from '@lactalink/types';
import { MapIcon } from 'lucide-react-native';
import React from 'react';
import MapView from 'react-native-maps';
import { DeliveryPreferenceCard, DonationInfoCard, RequestInfoCard } from '../cards';
import { MapBottomSheetProps } from '../map/MapBottomSheet';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { VStack } from '../ui/vstack';

interface MapMarkerInfoProps {
  selected: MapBottomSheetProps['value'];
  mapRef?: React.RefObject<MapView | null>;
  onViewOnMap?: (data: DeliveryPreference) => void;
}

export function MapMarkerInfo({ selected, mapRef, onViewOnMap }: MapMarkerInfoProps) {
  if (!selected) return null;

  const { slug, data } = selected;

  function DeliveryPreferencesCard({ data }: { data: DeliveryPreference[] }) {
    return data.map((preference, i) => {
      const [latitude, longitude] = (preference.address as Address).coordinates || [];

      function handleViewOnMap() {
        onViewOnMap?.(preference);

        if (latitude && longitude) {
          if (mapRef?.current) {
            mapRef.current.animateCamera({
              center: { latitude, longitude },
            });
          }
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

  if (slug === 'donations') {
    return (
      <VStack space="lg" className="w-full items-center">
        <DonationInfoCard data={data} />
        <DeliveryPreferencesCard data={data.deliveryDetails as DeliveryPreference[]} />
      </VStack>
    );
  }

  if (slug === 'requests') {
    return (
      <VStack space="lg" className="w-full items-center">
        <RequestInfoCard data={data} />
        <DeliveryPreferencesCard data={data.deliveryDetails as DeliveryPreference[]} />
      </VStack>
    );
  }
  return null;
}
