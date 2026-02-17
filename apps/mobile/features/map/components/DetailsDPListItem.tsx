import DeliveryModeIcons from '@/components/DeliveryModeIcons';
import TruncatedText from '@/components/TruncatedText';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { useCurrentCoordinates } from '@/lib/stores';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { latLngToPoint } from '@lactalink/utilities/geo-utils';
import { useRouter } from 'expo-router';
import { MapPinIcon, RouteIcon } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { MapQueryParams } from '../lib/types';

interface DetailsDPListItemProps {
  item: DeliveryPreference;
}

export default function DetailsDPListItem({ item }: DetailsDPListItemProps) {
  const router = useRouter();
  const address = extractCollection(item.address);
  const currentCoordinates = useCurrentCoordinates();

  const handleLocatePress = useCallback(() => {
    const coords = address?.coordinates;

    if (coords && currentCoordinates) {
      const startPoint = latLngToPoint(currentCoordinates);
      const destPoint = coords;

      // Clear any existing marker or coordinate params before setting new ones
      router.setParams({ mrk: undefined, lat: undefined, lng: undefined } as MapQueryParams);

      // Set the start and destination points in the query params to trigger map camera update
      router.setParams({
        start: startPoint.toString(),
        dest: destPoint.toString(),
      } as MapQueryParams);
    }
  }, [address?.coordinates, currentCoordinates, router]);

  return (
    <Card variant="elevated" className="flex-row items-center gap-2">
      <VStack space="xs" className="flex-1">
        <HStack space="sm">
          <DeliveryModeIcons modes={item.preferredMode} />
        </HStack>

        <HStack space="xs">
          <Icon as={MapPinIcon} />
          <TruncatedText initialLines={2} size="sm" containerClassName="flex-1">
            {address?.displayName || 'No address provided'}
          </TruncatedText>
        </HStack>
      </VStack>

      <Button
        action="info"
        className="h-fit w-fit rounded-full p-3"
        accessibilityLabel="Show Directions"
        onPress={handleLocatePress}
      >
        <ButtonIcon as={RouteIcon} className="h-6 w-6" />
      </Button>
    </Card>
  );
}
