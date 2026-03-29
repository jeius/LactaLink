import { ThumbnailMap } from '@/components/map/ThumbnailMap';
import TruncatedText from '@/components/TruncatedText';
import { Box } from '@/components/ui/box';
import { Card, CardProps } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import { useAddress } from '@/features/address/hooks/queries';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { formatDaysToText } from '@lactalink/utilities/formatters';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { CalendarDaysIcon, MapPinIcon } from 'lucide-react-native';
import DeliveryModeIcons from './DeliveryModeIcons';

const cardStyle = tva({
  base: 'w-44 p-0',
});

interface Props extends CardProps {
  data: DeliveryPreference;
}

function DeliveryPreferenceCard({ data, variant = 'filled', ...props }: Props) {
  const { data: addressDoc } = useAddress(data.address);

  const availableDaysText = formatDaysToText(data.availableDays, { short: true });
  const preferredModes = data.preferredMode;
  const fullAddress = addressDoc?.displayName || 'Unknown Address';
  const center = addressDoc?.coordinates && pointToLatLng(addressDoc.coordinates);

  return (
    <Card {...props} variant={variant} className={cardStyle({ className: props.className })}>
      <Box className="h-36 flex-1">
        {center ? (
          <ThumbnailMap center={center} className="flex-1" />
        ) : (
          <Skeleton variant="sharp" />
        )}

        <GradientBackground
          pointerEvents="none"
          colors={['transparent', 'transparent', 'black']}
          style={{ opacity: 0.3 }}
        />

        <DeliveryModeIcons
          modes={preferredModes}
          orientation="horizontal"
          size="2xs"
          space="xs"
          containerClassName="absolute inset-x-0 bottom-0 p-1"
        />
      </Box>

      <VStack space="sm" className="p-2">
        <HStack space="xs" className="items-start">
          <Icon size="sm" as={CalendarDaysIcon} />
          <TruncatedText
            size="xs"
            containerClassName="flex-1"
            className="font-JakartaMedium"
            initialLines={1}
          >
            {availableDaysText}
          </TruncatedText>
        </HStack>

        <HStack space="xs" className="items-start">
          <Icon size="sm" as={MapPinIcon} />
          <TruncatedText
            size="xs"
            containerClassName="flex-1"
            className="font-JakartaMedium"
            initialLines={2}
          >
            {fullAddress}
          </TruncatedText>
        </HStack>
      </VStack>
    </Card>
  );
}

function DeliveryPreferenceCardSkeleton({ variant = 'filled', ...props }: Omit<Props, 'data'>) {
  return (
    <Card {...props} variant={variant} className={cardStyle({ className: props.className })}>
      <Box className="h-36 flex-1">
        <Skeleton variant="sharp" />

        <GradientBackground
          pointerEvents="none"
          colors={['transparent', 'transparent', 'black']}
          style={{ opacity: 0.3 }}
        />
      </Box>

      <VStack space="sm" className="p-2">
        <Skeleton variant="sharp" className="h-4" />

        <VStack space="xs">
          <Skeleton variant="sharp" className="h-4" />
          <Skeleton variant="sharp" className="h-4 w-24" />
        </VStack>
      </VStack>
    </Card>
  );
}

export default Object.assign(DeliveryPreferenceCard, {
  Skeleton: DeliveryPreferenceCardSkeleton,
});
