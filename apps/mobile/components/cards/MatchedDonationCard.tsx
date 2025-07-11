import { useFetchById } from '@/hooks/collections/useFetchById';
import {
  Avatar as AvatarType,
  DeliveryPreference,
  DeliveryPreferenceSchema,
  Individual,
  MatchedDonationSchema,
} from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
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
  id?: string;
  onChange?: (
    donation: MatchedDonationSchema,
    deliveryPreference?: DeliveryPreferenceSchema | null
  ) => void;
  isLoading?: boolean;
}

export function MatchedDonationCard({
  id,
  onChange,
  isLoading: isLoadingProp,
}: MatchedDonationCardProps) {
  const { theme } = useTheme();
  const [selectedPreference, setSelectedPreference] = useState<DeliveryPreferenceSchema | null>(
    null
  );

  const {
    data,
    isLoading: isDataLoading,
    error,
  } = useFetchById(Boolean(id), {
    collection: 'donations',
    id,
    populate: { users: { profile: true, profileType: true, role: true } },
  });

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

  useEffect(() => {
    if (matchedDonationData) {
      onChange?.(matchedDonationData, selectedPreference);
    }
  }, [matchedDonationData, onChange, selectedPreference]);

  useEffect(() => {
    if (data?.deliveryDetails && data.deliveryDetails.length > 0) {
      const pref = data.deliveryDetails[0] as DeliveryPreference | null;
      const initialPreference: DeliveryPreferenceSchema | null =
        (pref && {
          id: pref.id,
          preferredMode: pref.preferredMode,
          address: extractID(pref.address),
          availableDays: pref.availableDays,
          name: pref.name,
        }) ||
        null;

      setSelectedPreference(initialPreference);

      if (onChange && matchedDonationData) {
        onChange(matchedDonationData, initialPreference);
      }
    }
  }, [data?.deliveryDetails, onChange, matchedDonationData]);

  function handlePreferenceChange(preference: DeliveryPreferenceSchema) {
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
            preferences={data?.deliveryDetails || []}
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
