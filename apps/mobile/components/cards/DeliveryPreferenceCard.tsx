import { DELIVERY_OPTIONS } from '@/lib/constants';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Address, DeliveryPreference } from '@lactalink/types';
import { formatDaysToText } from '@lactalink/utilities';
import { useRouter } from 'expo-router';
import { CalendarDaysIcon, EditIcon, MapPinIcon } from 'lucide-react-native';
import { GestureResponderEvent } from 'react-native';
import { Image } from '../Image';
import { Box } from '../ui/box';
import { Button, ButtonIcon } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const cardStyle = tva({
  base: 'relative w-full p-0',
  variants: {
    isSelected: {
      true: 'border-success-500',
    },
  },
});

interface DeliveryPreferenceCardProps {
  preference: DeliveryPreference;
  isSelected?: boolean;
  onEditPress?: () => void;
  isLoading?: boolean;
}

export default function DeliveryPreferenceCard({
  preference,
  isSelected,
  onEditPress,
  isLoading,
}: DeliveryPreferenceCardProps) {
  const router = useRouter();

  const { address, preferredMode, availableDays, name } = preference;
  const addressDPName = (address as Address | undefined)?.displayName || 'Unknown Address';
  const addressName = (address as Address | undefined)?.name || 'Unknown Address Name';
  const preferenceName = name || `Delivery Preference`;
  const availableDaysText = formatDaysToText(availableDays);

  function handleEditPress(event: GestureResponderEvent) {
    onEditPress?.();
    event.stopPropagation();
    router.push(`/delivery-preference/edit/${preference.id}`);
  }

  return (
    <Card className={cardStyle({ isSelected })}>
      <HStack>
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <VStack space="lg" className="flex-1 p-5">
            <Text className="font-JakartaSemiBold">{preferenceName}</Text>

            <VStack space="md">
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

              <HStack space="xs" className="items-start">
                <Icon as={CalendarDaysIcon} className="text-primary-500" />
                <Text size="sm" className="font-JakartaMedium flex-1">
                  {availableDaysText}
                </Text>
              </HStack>

              <HStack space="xs" className="items-start">
                <Icon as={MapPinIcon} className="text-primary-500" />
                <VStack className="flex-1">
                  <Text size="sm" className="font-JakartaMedium">
                    {addressName}
                  </Text>
                  <Text size="xs" className="font-JakartaMedium text-typography-700">
                    {addressDPName}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </VStack>
        )}

        <VStack space="md" className="bg-primary-100 justify-center p-4">
          <Button className="h-fit w-fit p-4" onPress={handleEditPress}>
            <ButtonIcon as={EditIcon} />
          </Button>
        </VStack>
      </HStack>

      {isSelected && (
        <Box
          className="bg-success-500 absolute right-0 top-0 px-4 py-2"
          style={{ borderBottomLeftRadius: 6 }}
        >
          <Text size="xs" className="text-success-0 font-JakartaMedium">
            Selected
          </Text>
        </Box>
      )}
    </Card>
  );
}

function CardSkeleton() {
  return (
    <VStack space="lg" className="flex-1 p-5">
      <Skeleton variant="rounded" className="h-8 w-40" />

      <VStack space="md">
        <HStack space="md" className="flex-wrap">
          <Skeleton variant="rounded" className="h-8 w-16" />
          <Skeleton variant="rounded" className="h-8 w-16" />
          <Skeleton variant="rounded" className="h-8 w-20" />
        </HStack>

        <Skeleton variant="rounded" className="h-5" />

        <VStack>
          <Skeleton variant="rounded" className="mb-1 h-5 w-36" />
          <Skeleton variant="rounded" className="h-4" />
        </VStack>
      </VStack>
    </VStack>
  );
}
