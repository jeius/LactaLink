import { Address, DeliveryPreference } from '@lactalink/types';

import { DELIVERY_OPTIONS } from '@/lib/constants';

import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { formatDaysToText } from '@lactalink/utilities';
import { MapIcon, MapPinIcon } from 'lucide-react-native';
import React from 'react';
import { LatLng } from 'react-native-maps';
import { Image } from '../Image';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface DeliveryPreferencesCardProps {
  preferences: DeliveryPreference[];
  onViewOnMap?: (latlng: LatLng) => void;
}
export function DeliveryPreferencesCard({
  preferences,
  onViewOnMap,
}: DeliveryPreferencesCardProps) {
  return preferences.map(({ address, preferredMode, availableDays, name }, i) => {
    const addressName = (address as Address).displayName;
    const [latitude, longitude] = (address as Address).coordinates || [];
    const preferenceName = name || `Delivery Preference ${i + 1}`;
    const availableDaysText = formatDaysToText(availableDays);

    function handleViewOnMap() {
      if (onViewOnMap && latitude && longitude) {
        onViewOnMap({ latitude, longitude });
      }
    }

    return (
      <Card key={i} className="w-full">
        <VStack space="lg">
          <Text className="font-JakartaMedium">{preferenceName}</Text>
          <VStack space="md">
            <VStack>
              <HStack space="sm" className="flex-wrap items-center">
                {preferredMode.map((mode, index) => {
                  const iconAsset = getDeliveryPreferenceIcon(mode);
                  return (
                    <HStack
                      key={index}
                      space="xs"
                      className="border-primary-500 items-center rounded-md border px-2 py-1"
                    >
                      <Image
                        source={iconAsset}
                        alt={`${mode}-icon`}
                        style={{ width: 16, height: 16 }}
                      />
                      <Text size="sm" className="text-primary-500 font-JakartaMedium">
                        {DELIVERY_OPTIONS[mode].label}
                      </Text>
                    </HStack>
                  );
                })}
              </HStack>
            </VStack>

            <Text size="sm">
              Preferred Days:{' '}
              <Text size="sm" className="font-JakartaSemiBold text-primary-500">
                {availableDaysText}
              </Text>
            </Text>

            <HStack space="xs" className="items-start">
              <Icon as={MapPinIcon} className="text-primary-500" />
              <Text size="sm" className="text-typography-700 flex-1">
                {addressName}
              </Text>
            </HStack>
          </VStack>
          <Button size="md" onPress={handleViewOnMap}>
            <ButtonIcon as={MapIcon} />
            <ButtonText>View on Map</ButtonText>
          </Button>
        </VStack>
      </Card>
    );
  });
}
