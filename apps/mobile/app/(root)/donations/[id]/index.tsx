import { AnimatedProgress } from '@/components/animated/progress';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { DeliveryPreferenceListCard } from '@/components/cards/DeliveryPreferenceListCard';
import { MilkBagCard } from '@/components/cards/MilkBagCard';
import { SingleImageViewer } from '@/components/ImageViewer';
import { ProfileTag } from '@/components/ProfileTag';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon, ThreeDotsIcon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { getDonationRequestStatusColor } from '@/lib/colors';
import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { COLLECTION_MODES, DONATION_REQUEST_STATUS, STORAGE_TYPES } from '@lactalink/enums';
import { DeliveryPreference, Donation, MilkBag } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { useLocalSearchParams } from 'expo-router';
import { DropletIcon, MessageCircleIcon, PackageIcon, ShareIcon } from 'lucide-react-native';
import React, { ComponentProps, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';

export default function DonationDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();

  const { data: meUser } = useMeUser();
  const meUserProfile = extractCollection(meUser?.profile?.value);

  const screen = useWindowDimensions();
  const isMobile = screen.width <= DEVICE_BREAKPOINTS.phone;

  const { data, ...query } = useFetchById(!!id, {
    collection: 'donations',
    id,
  });
  const isLoading = query.isLoading;
  const volume = data?.volume || 0;
  const remainingVolume = data?.remainingVolume || 0;
  const percentage = Math.round((remainingVolume / volume) * 100);

  const donor = extractCollection(data?.donor);
  const isOwner = meUserProfile?.id === donor?.id;

  const status = data?.status;

  const { image, bags } = useMemo(() => {
    const milkSample = extractCollection(data?.details?.milkSample);
    const image = extractOneImageData(milkSample, isMobile ? 'sm' : 'lg');
    const bags = extractCollection(data?.details?.bags);
    return { image, bags };
  }, [data, isMobile]);

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <ScrollView contentContainerClassName="grow flex-col items-stretch justify-start">
        <HStack className="items-center justify-between p-5">
          <ProfileTag
            isLoading={isLoading}
            profile={donor && { value: donor, relationTo: 'individuals' }}
            label="Donor"
          />

          <VStack className="items-end">
            {isLoading ? (
              <>
                <Skeleton variant="circular" className="mb-1 h-3 w-20" />
                <Skeleton variant="circular" className="h-3 w-14" />
              </>
            ) : (
              data?.createdAt && (
                <>
                  <Text size="xs">{formatDate(data.createdAt, { shortMonth: true })}</Text>
                  <Text size="xs">{formatLocaleTime(data.createdAt)}</Text>
                </>
              )
            )}
          </VStack>
        </HStack>

        <Box className="bg-background-200 relative h-64 w-full">
          {isLoading ? (
            <Skeleton variant="sharp" />
          ) : (
            <SingleImageViewer image={image} className="grow" />
          )}

          <GradientBackground
            colors={['transparent', 'transparent', 'black']}
            pointerEvents="none"
            style={{ opacity: 0.6 }}
          />

          <HStack
            space="md"
            className="absolute inset-x-0 bottom-0 -mb-5 items-center justify-end px-5"
          >
            <Button action="muted" className="h-fit w-fit rounded-full p-3">
              <ButtonIcon as={MessageCircleIcon} />
            </Button>
            <Button action="muted" className="h-fit w-fit rounded-full p-3">
              <ButtonIcon as={ShareIcon} />
            </Button>
            <Button action="muted" className="h-fit w-fit rounded-full p-3">
              <ButtonIcon as={ThreeDotsIcon} />
            </Button>
          </HStack>
        </Box>

        <HStack className="mt-4 items-center justify-between p-5">
          {isLoading ? (
            <>
              <VStack>
                <Skeleton variant="rounded" className="mb-1 h-6 w-32" />
                <Skeleton variant="rounded" className="h-4 w-24" />
              </VStack>
              <Skeleton variant="circular" className="h-10 w-32" />
            </>
          ) : (
            <>
              <VStack>
                <Text bold size="lg">
                  {volume.toLocaleString()} mL
                </Text>
                <Text size="sm">Total Volume</Text>
              </VStack>
              {status && (
                <Card
                  className="rounded-full border-0 px-4 py-2"
                  style={{ backgroundColor: getDonationRequestStatusColor(theme, status) }}
                >
                  <Text className="font-JakartaSemiBold text-center text-white">
                    {DONATION_REQUEST_STATUS[status].label}
                  </Text>
                </Card>
              )}
            </>
          )}
        </HStack>

        <VStack className="mb-5 items-stretch px-5">
          {isLoading ? (
            <Skeleton variant="circular" className="mb-1 h-3 w-full" />
          ) : (
            <>
              <AnimatedProgress size="sm" orientation="horizontal" value={percentage} />
              <Text size="xs" className="text-typography-700 text-center">
                {remainingVolume} mL remaining
              </Text>
            </>
          )}
        </VStack>

        <Divider />

        <Tags isLoading={isLoading} data={data} />

        <MilkBagList isLoading={isLoading} data={extractCollection(bags) || []} className="mb-5" />

        <PreferenceList
          isLoading={isLoading}
          data={extractCollection(data?.deliveryPreferences) || []}
          className="mb-5"
        />
      </ScrollView>
    </SafeArea>
  );
}

// #region Components

const PLACEHOLDER_DATA = generatePlaceHoldersWithID(4, {});

interface TagsProps {
  isLoading?: boolean;
  data?: Donation;
}
function Tags({ isLoading, data }: TagsProps) {
  const storage = STORAGE_TYPES[data?.details.storageType || 'OTHER'].label;
  const method = COLLECTION_MODES[data?.details.collectionMode || 'MANUAL'].label;
  return (
    <HStack space="2xl" className="flex-wrap p-5">
      {isLoading ? (
        <>
          <Skeleton variant="circular" className="h-7 w-32" />
          <Skeleton variant="circular" className="h-7 w-32" />
        </>
      ) : (
        <>
          <HStack space="sm" className="items-center">
            <Card className="rounded-full border-0 p-2">
              <Icon as={PackageIcon} size="sm" />
            </Card>
            <Text size="sm">{storage}</Text>
          </HStack>
          <HStack space="sm" className="items-center">
            <Card className="rounded-full border-0 p-2">
              <Icon as={DropletIcon} size="sm" />
            </Card>
            <Text size="sm">{method}</Text>
          </HStack>
        </>
      )}
    </HStack>
  );
}

interface PreferenceListProps extends ComponentProps<typeof VStack> {
  data: DeliveryPreference[];
  isLoading?: boolean;
}

function PreferenceList({ data, isLoading, ...props }: PreferenceListProps) {
  if (data.length === 0) {
    return <Text size="sm">No delivery preferences specified.</Text>;
  }

  return (
    <VStack {...props}>
      <Text className="font-JakartaSemiBold mx-5 mb-1">Delivery Preferences</Text>
      <FlatList
        data={isLoading ? (PLACEHOLDER_DATA as typeof data) : data}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <Box className="w-4" />}
        contentContainerClassName="px-5"
        renderItem={({ item }) => {
          const isLoading = isPlaceHolderData(item);
          return <DeliveryPreferenceListCard data={item} isLoading={isLoading} />;
        }}
      />
    </VStack>
  );
}

interface MilkBagListProps extends ComponentProps<typeof VStack> {
  data: MilkBag[];
  isLoading?: boolean;
}

function MilkBagList({ data, isLoading, ...props }: MilkBagListProps) {
  if (data.length === 0) {
    return <Text size="sm">No milk bags available.</Text>;
  }

  return (
    <VStack {...props}>
      <Text className="font-JakartaSemiBold mx-5 mb-1">Milk Bags</Text>
      <FlatList
        data={isLoading ? (PLACEHOLDER_DATA as typeof data) : data}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <Box className="w-4" />}
        contentContainerClassName="px-5"
        renderItem={({ item }) => {
          const isLoading = isPlaceHolderData(item);
          return <MilkBagCard data={item} isLoading={isLoading} />;
        }}
      />
    </VStack>
  );
}

interface CTAProps {
  isOwner: boolean;
  status?: keyof typeof DONATION_REQUEST_STATUS;
  onPress(): () => void;
}
function CTA({ isOwner, status, onPress }: CTAProps) {
  let label = 'Request This Donation';

  if (isOwner) {
  }
}

// #endregion Components
