import DeliveryModeIcons from '@/components/DeliveryModeIcons';
import TruncatedText from '@/components/TruncatedText';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { USER_MARKER_ID } from '@/lib/constants';
import { useCurrentCoordinates } from '@/lib/stores';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { MapPinIcon, RouteIcon } from 'lucide-react-native';
import React from 'react';
import { RNMarker } from 'react-native-google-maps-plus';
import { useDirectionActions } from '../contexts/directions';

interface Props {
  data: DeliveryPreference;
  marker: RNMarker;
}

export default function DeliveryPreferenceCard({ data: item, marker }: Props) {
  const address = extractCollection(item.address);
  const addressName = address?.displayName || 'Unknown Location';
  const currentCoordinates = useCurrentCoordinates();

  const { startNavigation, setInputs } = useDirectionActions();

  const handleLocatePress = () => {
    if (currentCoordinates) {
      setInputs({
        origin: {
          coordinates: currentCoordinates,
          name: 'Your Location',
          markerID: USER_MARKER_ID,
        },
        destination: {
          coordinates: marker.coordinate,
          name: addressName,
          markerID: marker.id,
        },
      });

      startNavigation();
    }
  };

  return (
    <Card variant="elevated" className="flex-row items-center gap-2 rounded-none">
      <VStack space="xs" className="flex-1">
        <HStack space="sm">
          <DeliveryModeIcons modes={item.preferredMode} />
        </HStack>

        <HStack space="xs">
          <Icon as={MapPinIcon} />
          <TruncatedText initialLines={2} size="sm" containerClassName="flex-1">
            {addressName}
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
