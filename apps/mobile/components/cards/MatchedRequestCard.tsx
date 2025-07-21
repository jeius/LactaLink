import { useFetchById } from '@/hooks/collections/useFetchById';
import { getPriorityColor } from '@/lib/utils/getPriorityColor';
import { PREFERRED_STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import {
  Avatar as AvatarType,
  DeliveryPreference,
  DeliveryPreferenceSchema,
  Individual,
  MatchedRequestSchema,
  Request,
} from '@lactalink/types';
import { extractCollection, extractID, isString } from '@lactalink/utilities';
import { PackageIcon } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../AppProvider/ThemeProvider';
import Avatar from '../Avatar';
import { DeliveryPreferencesBottomSheet } from '../bottom-sheets/DeliveryPreferencesBottomSheet';
import FastTimerIcon from '../icons/FastTimerIcon';
import { Box } from '../ui/box';
import { Button, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';
import { DeliveryPreferenceCard, DeliveryPreferenceCardSkeleton } from './DeliveryPreferenceCard';

interface MatchedRequestCardProps {
  request: string | Request;
  onChange?: (
    request: MatchedRequestSchema,
    deliveryPreference?: DeliveryPreferenceSchema | null
  ) => void;
  isLoading?: boolean;
}

export default function MatchedRequestCard({
  request: requestProp,
  onChange,
  isLoading: isLoadingProp,
}: MatchedRequestCardProps) {
  const { theme } = useTheme();
  const [selectedPreference, setSelectedPreference] = useState<DeliveryPreferenceSchema | null>(
    null
  );

  const shouldFetch = isString(requestProp);

  const {
    data: fetchedData,
    isLoading: isDataLoading,
    error,
  } = useFetchById(shouldFetch, {
    collection: 'requests',
    id: extractID(requestProp),
    populate: { users: { profile: true, profileType: true, role: true } },
  });

  const data = shouldFetch ? fetchedData : extractCollection(requestProp);

  const requester = data?.requester as Individual | null;
  const requesterAvatar = requester?.avatar as AvatarType | null;
  const { details: { urgency, storagePreference } = {} } = data || {};

  const isLoading = isLoadingProp || isDataLoading;

  const matchedRequestData = useMemo((): MatchedRequestSchema | undefined | null => {
    return (
      data && {
        id: data.id,
        requester: extractID(data.requester),
        storagePreference: data.details.storagePreference || 'EITHER',
        volumeNeeded: data.volumeNeeded,
      }
    );
  }, [data]);

  useEffect(() => {
    if (matchedRequestData) {
      onChange?.(matchedRequestData, selectedPreference);
    }
  }, [matchedRequestData, onChange, selectedPreference]);

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

      if (onChange && matchedRequestData) {
        onChange(matchedRequestData, initialPreference);
      }
    }
  }, [data?.deliveryDetails, onChange, matchedRequestData]);

  function handlePreferenceChange(preference: DeliveryPreferenceSchema) {
    setSelectedPreference(preference);
    if (onChange && matchedRequestData) {
      onChange(matchedRequestData, preference);
    }
  }

  return isLoading ? (
    <CardPlaceholder />
  ) : (
    <Card
      className="border-outline-500 relative w-full p-0"
      style={{ shadowColor: getPriorityColor(theme, urgency) }}
    >
      <Box
        className="absolute inset-0"
        style={{ backgroundColor: getPriorityColor(theme, urgency, 200), opacity: 0.05 }}
      />
      <VStack>
        <HStack
          space="md"
          className="items-start p-4"
          style={{ backgroundColor: getPriorityColor(theme, urgency, 50) }}
        >
          <Avatar
            size="lg"
            details={{ avatar: requesterAvatar, name: requester?.displayName || 'Unknown User' }}
          />
          <VStack className="flex-1">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="font-JakartaMedium"
              style={{ color: getPriorityColor(theme, urgency, 950) }}
            >
              {requester?.displayName || 'Unknown User'}
            </Text>

            <HStack space="xs" className="items-center">
              <Icon
                size="sm"
                as={PackageIcon}
                style={{ color: getPriorityColor(theme, urgency, 800) }}
              />
              <Text
                size="sm"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ color: getPriorityColor(theme, urgency, 800) }}
              >
                {PREFERRED_STORAGE_TYPES[storagePreference || 'EITHER'].label}
              </Text>
            </HStack>

            <HStack space="xs" className="items-center">
              <Icon
                size="sm"
                as={FastTimerIcon}
                fill={getPriorityColor(theme, urgency)?.toString()}
              />
              <Text
                size="sm"
                className="font-JakartaMedium"
                style={{ color: getPriorityColor(theme, urgency) }}
              >
                {URGENCY_LEVELS[urgency || 'LOW'].label}
              </Text>
            </HStack>
          </VStack>

          <Text
            className="font-JakartaBold"
            style={{ color: getPriorityColor(theme, urgency, 950) }}
          >
            {data?.volumeNeeded} mL
          </Text>
        </HStack>

        <Divider />

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
