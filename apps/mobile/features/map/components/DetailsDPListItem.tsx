import DeliveryModeIcons from '@/components/DeliveryModeIcons';
import TruncatedText from '@/components/TruncatedText';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { Address, DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { MapPinIcon, RouteIcon } from 'lucide-react-native';
import React, { useCallback } from 'react';

interface DetailsDPListItemProps {
  item: DeliveryPreference;
  onLocatePress?: (address: Address) => void;
}

export default function DetailsDPListItem({ item, onLocatePress }: DetailsDPListItemProps) {
  const address = extractCollection(item.address);

  const handleLocatePress = useCallback(() => {
    if (address) onLocatePress?.(address);
  }, [address, onLocatePress]);

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
