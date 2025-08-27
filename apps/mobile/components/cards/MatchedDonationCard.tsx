import { useFetchById } from '@/hooks/collections/useFetchById';
import {
  Avatar as AvatarType,
  DeliveryPreference,
  Individual,
  MatchedDonationSchema,
  MilkBagSchema,
} from '@lactalink/types';
import { extractCollection, extractID } from '@lactalink/utilities';
import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../AppProvider/ThemeProvider';

import { getHexColor } from '@/lib/colors';
import { COLLECTION_MODES, PREFERRED_STORAGE_TYPES } from '@/lib/constants';
import { useLocationStore } from '@/lib/stores/locationStore';
import { extractMilkBagSchema } from '@/lib/utils/extractMilkBagShema';
import { getNearestDeliveryPreference } from '@/lib/utils/getNearestDeliveryPreference';
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
  donation: MatchedDonationSchema;
  onChange?: (
    donation: MatchedDonationSchema,
    deliveryPreference?: DeliveryPreference | null
  ) => void;
  isLoading?: boolean;
}

export function MatchedDonationCard({
  donation,
  onChange,
  isLoading: isLoadingProp,
}: MatchedDonationCardProps) {
  const { theme } = useTheme();
  const [selectedPreference, setSelectedPreference] = useState<DeliveryPreference | null>(null);
  const coords = useLocationStore((s) => s.coordinates);

  const { data, isLoading: isDataLoading } = useFetchById(true, {
    collection: 'donations',
    id: extractID(donation),
  });

  const donor = data?.donor as Individual | null;
  const donorAvatar = donor?.avatar as AvatarType | null;
  const { details: { storageType, collectionMode } = {} } = data || {};

  const isLoading = isLoadingProp || isDataLoading;

  const matchedDonationData = useMemo((): MatchedDonationSchema | undefined | null => {
    const bags = extractCollection(data?.details?.bags || []);
    return (
      data && {
        id: data.id,
        donor: extractID(data.donor),
        storageType: data.details.storageType,
        bags: bags.map((bag) => extractMilkBagSchema(bag) as MilkBagSchema),
      }
    );
  }, [data]);

  const deliveryPreferences = useMemo(
    () => extractCollection(data?.deliveryPreferences) || [],
    [data?.deliveryPreferences]
  );

  useEffect(() => {
    if (deliveryPreferences.length > 0) {
      const { deliveryPreference } = getNearestDeliveryPreference(deliveryPreferences, coords);

      setSelectedPreference(deliveryPreference);

      if (matchedDonationData) {
        onChange?.(matchedDonationData, deliveryPreference);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryPreferences, matchedDonationData]);

  function handlePreferenceChange(preference: string) {
    const preferenceObj = deliveryPreferences.find((p) => extractID(p) === preference) || null;
    setSelectedPreference(preferenceObj);

    if (onChange && matchedDonationData) {
      onChange(matchedDonationData, preferenceObj);
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
