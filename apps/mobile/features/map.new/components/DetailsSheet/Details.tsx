import { AnimatedProgress } from '@/components/animated/progress';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BasicBadge } from '@/components/badges';
import { SingleImageViewer } from '@/components/ImageViewer';
import { ProfileTag } from '@/components/ProfileTag';
import TruncatedText from '@/components/TruncatedText';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useDefaultAddress } from '@/features/address/hooks/useDefaultAddress';
import { getUrgencyAction } from '@/lib/utils/getUrgencyAction';
import { URGENCY_LEVELS } from '@lactalink/enums';
import { Collection } from '@lactalink/types/collections';
import { Donation, Hospital, MilkBank, Request } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import {
  extractCollection,
  extractImageData,
  extractOneImageData,
} from '@lactalink/utilities/extractors';
import { isHospital } from '@lactalink/utilities/type-guards';
import {
  ArrowRightLeftIcon,
  DatabaseIcon,
  MapPinIcon,
  MilkIcon,
  PhoneIcon,
  SquareUserIcon,
} from 'lucide-react-native';
import { useMemo } from 'react';
import { DataMarkerSlug } from '../../lib/types';

type BaseProps<T> = { data: T };

function DonationDetails({ data }: BaseProps<Donation>) {
  const { themeColors } = useTheme();
  const iconFillColor = themeColors.primary[50];
  const iconStrokeColor = themeColors.primary[700];

  const {
    details: { milkSample },
    remainingVolume,
    volume,
  } = data;

  const volumePercentage = Math.round((remainingVolume / volume) * 100);
  const image = extractOneImageData(extractCollection(milkSample));
  const donor = { value: data.donor, relationTo: 'individuals' } as const;

  return (
    <VStack space="lg" className="bg-background-0 px-4 pb-4 shadow">
      <Box className="h-40 w-full overflow-hidden rounded-2xl bg-background-100">
        <SingleImageViewer image={image} />
      </Box>

      <HStack className="items-center justify-between">
        <VStack>
          <Text bold size="xl">
            {displayVolume(volume)}
          </Text>
          <Text size="sm">Total Volume</Text>
        </VStack>

        <ProfileTag direction="rtl" label="Donor" profile={donor} />
      </HStack>

      <VStack space="lg">
        <VStack>
          <HStack space="sm" className="items-center justify-between">
            <Text size="sm" className="mb-1">
              Available Volume
            </Text>

            <Icon as={MilkIcon} size="sm" fill={iconFillColor} stroke={iconStrokeColor} />
          </HStack>

          <AnimatedProgress value={volumePercentage} size="sm" />

          <Text size="xs" className="mt-1 text-center text-typography-700">
            {remainingVolume.toLocaleString()} mL ({volumePercentage}%)
          </Text>
        </VStack>
      </VStack>
    </VStack>
  );
}

function RequestDetails({ data }: BaseProps<Request>) {
  const { themeColors } = useTheme();
  const iconFillColor = themeColors.tertiary[50];
  const iconStrokeColor = themeColors.tertiary[700];

  const {
    details: { urgency },
    initialVolumeNeeded,
    volumeFulfilled,
  } = data;

  const volumePercentage = Math.round((volumeFulfilled / initialVolumeNeeded) * 100);
  const image = extractImageData(extractCollection(data.details.image));
  const requester = { relationTo: 'individuals', value: data.requester } as const;

  return (
    <VStack space="lg" className="bg-background-0 px-4 pb-4 shadow">
      <Box className="h-40 w-full overflow-hidden rounded-2xl bg-background-100">
        <SingleImageViewer image={image} />
        <BasicBadge
          text={URGENCY_LEVELS[urgency].label}
          action={getUrgencyAction(urgency)}
          className="absolute left-3 top-3"
        />
      </Box>

      <HStack className="items-center justify-between">
        <VStack>
          <Text bold size="xl">
            {displayVolume(initialVolumeNeeded)}
          </Text>
          <Text size="sm">Total Needed</Text>
        </VStack>

        <ProfileTag direction="rtl" label="Requester" profile={requester} />
      </HStack>

      <VStack space="lg">
        <VStack>
          <HStack space="sm" className="items-center justify-between">
            <Text size="sm" className="mb-1">
              Volume Fulfilled
            </Text>

            <Icon as={MilkIcon} size="sm" fill={iconFillColor} stroke={iconStrokeColor} />
          </HStack>

          <AnimatedProgress value={volumePercentage} size="sm" />

          <Text size="xs" className="mt-1 text-center text-typography-700">
            {volumeFulfilled.toLocaleString()} mL ({volumePercentage}%)
          </Text>
        </VStack>
      </VStack>
    </VStack>
  );
}

function OrganizationDetails({ data }: BaseProps<Hospital | MilkBank>) {
  const { avatar, displayName, name, description, head, phone, totalVolume, receivedTransactions } =
    data;
  const orgKind = isHospital(data) ? 'Hospital' : 'Milk Bank';
  const totalTransactions = receivedTransactions?.totalDocs ?? 0;

  const image = extractImageData(extractCollection(avatar));

  const { address, ...addrQuery } = useDefaultAddress({
    value: data,
    relationTo: isHospital(data) ? 'hospitals' : 'milkBanks',
  });

  const location = address?.displayName || 'Location not available';

  const infoRows = useMemo(
    () =>
      [
        head ? { icon: SquareUserIcon, label: head } : null,
        phone ? { icon: PhoneIcon, label: phone } : null,
        { icon: MapPinIcon, label: location, isLoading: addrQuery.isLoading },
      ].filter((v) => v !== null),
    [addrQuery.isLoading, head, location, phone]
  );

  return (
    <VStack space="lg" className="bg-background-0 px-4 pb-4 shadow">
      <Box className="h-40 w-full overflow-hidden rounded-2xl bg-background-100">
        <SingleImageViewer image={image} />
        <Box
          className="absolute rounded-full bg-secondary-500 px-3 py-1"
          style={{ bottom: 8, right: 8 }}
        >
          <Text size="sm" className="font-JakartaSemiBold text-secondary-0">
            {orgKind}
          </Text>
        </Box>
      </Box>

      <VStack space="xs">
        <Text bold size="xl" numberOfLines={1}>
          {displayName ?? name}
        </Text>
        {description && (
          <TruncatedText size="sm" className="text-typography-600" initialLines={2}>
            {description}
          </TruncatedText>
        )}
      </VStack>

      {infoRows.length > 0 && (
        <>
          <Divider />
          <VStack space="sm">
            {infoRows.map(({ icon, label, isLoading }, i) => (
              <HStack key={i} space="sm" className="items-center">
                <Icon as={icon} size="sm" className="text-typography-800" />
                {isLoading ? (
                  <Skeleton variant="sharp" className="h-4 w-auto flex-1" />
                ) : (
                  <TruncatedText size="sm" containerClassName="flex-1" initialLines={2}>
                    {label}
                  </TruncatedText>
                )}
              </HStack>
            ))}
          </VStack>
        </>
      )}

      <Divider />

      <HStack space="md">
        <VStack space="xs" className="flex-1 items-center rounded-xl bg-secondary-50 px-3 py-3">
          <Icon as={DatabaseIcon} size="md" className="stroke-secondary-700" />
          <Text bold size="lg" className="text-secondary-700">
            {displayVolume(totalVolume ?? 0)}
          </Text>
          <Text size="xs" className="text-center text-secondary-500">
            Total Stock
          </Text>
        </VStack>

        <VStack space="xs" className="flex-1 items-center rounded-xl bg-secondary-50 px-3 py-3">
          <Icon as={ArrowRightLeftIcon} size="md" className="stroke-secondary-700" />
          <Text bold size="lg" className="text-secondary-700">
            {totalTransactions.toLocaleString()}
          </Text>
          <Text size="xs" className="text-center text-secondary-500">
            Transactions
          </Text>
        </VStack>
      </HStack>
    </VStack>
  );
}

interface DetailsProps<TSlug extends DataMarkerSlug> {
  relationTo: TSlug;
  value: Collection<TSlug>;
}

export default function Details<TSlug extends DataMarkerSlug>({
  relationTo,
  value,
}: DetailsProps<TSlug>) {
  switch (relationTo) {
    case 'donations':
      return <DonationDetails data={value as Donation} />;
    case 'requests':
      return <RequestDetails data={value as Request} />;
    default:
      return <OrganizationDetails data={value as Hospital | MilkBank} />;
  }
}
