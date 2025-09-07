import { getPriorityColor } from '@/lib/utils/getPriorityColor';
import { PREFERRED_STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { DeliveryPreference, Request } from '@lactalink/types';
import { extractCollection, extractID } from '@lactalink/utilities';
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
  request?: Request;
  selected?: DeliveryPreference | null;
  onSelect?: (deliveryPreference?: DeliveryPreference | null) => void;
  isLoading?: boolean;
}

export default function MatchedRequestCard({
  request: data,
  onSelect,
  selected,
  isLoading,
}: MatchedRequestCardProps) {
  const { theme } = useTheme();
  const [selectedPreference, setSelectedPreference] = useState(selected);

  const requester = extractCollection(data?.requester);
  const requesterAvatar = extractCollection(requester?.avatar);
  const { details: { urgency, storagePreference } = {} } = data || {};

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
            selected={extractID(selectedPreference)}
            collections={deliveryPreferences}
            onChange={handlePreferenceChange}
            allowMultipleSelection={false}
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
