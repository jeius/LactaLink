import { useFetchById } from '@/hooks/collections/useFetchById';
import { Avatar as AvatarType, Individual, MatchedDonationSchema } from '@lactalink/types';
import { extractCollection, extractID, isString } from '@lactalink/utilities';
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
  donation: string;
  onChange?: (donation: MatchedDonationSchema, deliveryPreference?: string | null) => void;
  isLoading?: boolean;
}

export function MatchedDonationCard({
  donation,
  onChange,
  isLoading: isLoadingProp,
}: MatchedDonationCardProps) {
  const { theme } = useTheme();
  const [selectedPreference, setSelectedPreference] = useState<string | null>(null);

  const shouldFetch = isString(donation);

  const {
    data: fetchedData,
    isLoading: isDataLoading,
    error,
  } = useFetchById(shouldFetch, {
    collection: 'donations',
    id: extractID(donation),
    populate: { users: { profile: true, profileType: true, role: true } },
  });

  const data = shouldFetch ? fetchedData : extractCollection(donation);

  const donor = data?.donor as Individual | null;
  const donorAvatar = donor?.avatar as AvatarType | null;
  const { details: { storageType, collectionMode } = {} } = data || {};

  const isLoading = isLoadingProp || isDataLoading;

  const matchedDonationData = useMemo((): MatchedDonationSchema | undefined | null => {
    return (
      data && {
        id: data.id,
        donor: extractID(data.donor),
        bags: extractID(data.details.bags),
        storageType: data.details.storageType,
      }
    );
  }, [data]);

  const deliveryPreferences = data?.deliveryPreferences || [];

  useEffect(() => {
    if (deliveryPreferences.length > 0) {
      const pref = deliveryPreferences[0];
      const prefID = (pref && extractID(pref)) || null;

      setSelectedPreference(prefID);

      if (matchedDonationData) {
        onChange?.(matchedDonationData, prefID);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryPreferences, matchedDonationData]);

  function handlePreferenceChange(preference: string) {
    setSelectedPreference(preference);
    if (onChange && matchedDonationData) {
      onChange(matchedDonationData, preference);
    }
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
            selected={selectedPreference}
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
    <Card className="relative w-full">
      <VStack space="lg">
        <HStack space="md" className="items-start">
          <Skeleton variant="circular" className="h-16 w-16" />
          <VStack space="xs" className="flex-1">
            <Skeleton variant="sharp" className="h-5 w-32" />
            <Skeleton variant="sharp" className="h-4 w-24" />
            <Skeleton variant="sharp" className="h-4 w-16" />
          </VStack>

          <Skeleton className="h-8 w-16" />
        </HStack>

        <VStack space="lg" className="p-4">
          <DeliveryPreferenceCardSkeleton />
          <Skeleton className="h-10" />
        </VStack>
      </VStack>
    </Card>
  );
}
