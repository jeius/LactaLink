import DeliveryModeIcons from '@/components/DeliveryModeIcons';
import TruncatedText from '@/components/TruncatedText';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { USER_MARKER_ID } from '@/lib/constants';
import { useCurrentCoordinates } from '@/lib/stores';
import { createMarkerID } from '@/lib/utils/markerUtils';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { MapPinIcon, RouteIcon } from 'lucide-react-native';
import React from 'react';
import { useDirectionActions } from './contexts/directions';

interface DetailsDPListItemProps {
  item: DeliveryPreference;
  parentID: string;
  parentSlug: Extract<CollectionSlug, 'donations' | 'requests'>;
}

export default function DetailsDPListItem({ item, parentID, parentSlug }: DetailsDPListItemProps) {
  const address = extractCollection(item.address);
  const currentCoordinates = useCurrentCoordinates();

  const { startNavigation, setInputs } = useDirectionActions();

  const handleLocatePress = () => {
    const coords = address?.coordinates;
    const addressName = address?.displayName || 'Unknown Location';

    if (coords && currentCoordinates) {
      setInputs({
        origin: {
          coordinates: currentCoordinates,
          name: 'Your Location',
          markerID: USER_MARKER_ID,
        },
        destination: {
          coordinates: pointToLatLng(coords),
          name: addressName,
          markerID: createMarkerID(parentSlug, parentID, coords), // Generate a markerID for the destination
        },
      });

      startNavigation();
    }
  };

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
