import { DeliveryPreference, Donation } from '@lactalink/types';
import { extractCollection, extractID } from '@lactalink/utilities';
import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../AppProvider/ThemeProvider';

import { getHexColor } from '@/lib/colors';
import { COLLECTION_MODES, PREFERRED_STORAGE_TYPES } from '@/lib/constants';
import { DropletIcon, PackageIcon } from 'lucide-react-native';
import Avatar from '../Avatar';
import { DeliveryPreferencesBottomSheet } from '../bottom-sheets/DeliveryPreferencesBottomSheet';
import { Button, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';
import { DeliveryPreferenceCard, DeliveryPreferenceCardSkeleton } from './DeliveryPreferenceCard';

interface MatchedDonationCardProps {
  donation?: Donation;
  selected?: DeliveryPreference | null;
  onSelect?: (deliveryPreference?: DeliveryPreference | null) => void;
  isLoading?: boolean;
}

export function MatchedDonationCard({
  donation: data,
  onSelect,
  selected,
  isLoading,
}: MatchedDonationCardProps) {
  const { theme } = useTheme();
  const [selectedPreference, setSelectedPreference] = useState(selected);

  const donor = extractCollection(data?.donor);
  const donorAvatar = extractCollection(donor?.avatar);
  const { details: { storageType, collectionMode } = {} } = data || {};

  const deliveryPreferences = useMemo(
    () => extractCollection(data?.deliveryPreferences) || [],
    [data?.deliveryPreferences]
  );

  useEffect(() => {
    setSelectedPreference(selected);
  }, [selected]);

  function handlePreferenceChange(preferenceID: string) {
    const selectedPref = deliveryPreferences.find((dp) => extractID(dp) === preferenceID);
    const preference = extractCollection(selectedPref);
    setSelectedPreference(preference);
    onSelect?.(preference);
  }

  return isLoading ? (
    <CardPlaceholder />
  ) : (
    <Card
      className="border-outline-500 relative w-full p-0"
      style={{ shadowColor: getHexColor(theme, 'primary', 400) }}
    >
      <VStack>
        <HStack
          space="md"
          className="items-start p-4"
          style={{ backgroundColor: getHexColor('light', 'primary', 500) }}
        >
          <Avatar
            size="lg"
            details={{ avatar: donorAvatar, name: donor?.displayName || 'Unknown User' }}
          />
          <VStack className="flex-1">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="font-JakartaSemiBold text-primary-0"
            >
              {donor?.displayName || 'Unknown User'}
            </Text>

            <HStack space="xs" className="items-center">
              <Icon size="sm" as={PackageIcon} className="text-primary-0" />
              <Text
                size="sm"
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-primary-0 font-JakartaMedium"
              >
                {PREFERRED_STORAGE_TYPES[storageType || 'EITHER'].label}
              </Text>
            </HStack>

            <HStack space="xs" className="items-center">
              <Icon size="sm" as={DropletIcon} className="text-primary-0" />
              <Text size="sm" className="text-primary-0 font-JakartaMedium">
                {COLLECTION_MODES[collectionMode || 'MANUAL'].label}
              </Text>
            </HStack>
          </VStack>

          <Text className="font-JakartaBold text-primary-0">{data?.remainingVolume} mL</Text>
        </HStack>

        <VStack space="lg" className="p-4">
          {selectedPreference && (
            <DeliveryPreferenceCard
              variant="ghost"
              className="p-0"
              preference={selectedPreference}
            />
          )}
          <DeliveryPreferencesBottomSheet
            selected={extractID(selectedPreference)}
            collections={deliveryPreferences}
            onChange={handlePreferenceChange}
            triggerComponent={(props) => (
              <Button
                {...props}
                animateOnPress={false}
                size="sm"
                variant="outline"
                action="default"
              >
                <ButtonText>Choose a Delivery Preference</ButtonText>
              </Button>
            )}
          />
        </VStack>
      </VStack>
    </Card>
  );
}

function CardPlaceholder() {
  return (
    <Card className="relative w-full p-0">
      <VStack space="lg">
        <HStack space="md" className="bg-background-100 items-start p-4">
          <Skeleton variant="circular" className="h-16 w-16" />
          <VStack space="xs" className="flex-1">
            <Skeleton variant="circular" className="h-5 w-32" />
            <Skeleton variant="circular" className="h-4 w-24" />
            <Skeleton variant="circular" className="h-4 w-20" />
          </VStack>

          <Skeleton className="h-8 w-16" />
        </HStack>

        <VStack space="md" className="p-4 pt-0">
          <DeliveryPreferenceCardSkeleton />
          <Skeleton className="h-10" />
        </VStack>
      </VStack>
    </Card>
  );
}
