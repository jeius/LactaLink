import { AnimatedPressable } from '@/components/animated/pressable';
import { AnimatedProgress } from '@/components/animated/progress';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { DeliveryPreferenceCard } from '@/components/cards/DeliveryPreferenceCard';
import { MilkBagCard } from '@/components/cards/MilkBagCard';
import { SingleImageViewer } from '@/components/ImageViewer';
import { ProfileTag } from '@/components/ProfileTag';
import SafeArea from '@/components/SafeArea';
import { CollectionMethodTag, StorageTypeTag } from '@/components/tags';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon, ThreeDotsIcon } from '@/components/ui/icon';
import { Popover, PopoverBackdrop, PopoverContent } from '@/components/ui/popover';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { getDonationRequestStatusColor } from '@/lib/colors';
import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { DeliveryPreference, MilkBag } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { Link, useLocalSearchParams } from 'expo-router';
import {
  EditIcon,
  MessageCircleIcon,
  ShareIcon,
  Trash2Icon,
  XCircleIcon,
} from 'lucide-react-native';
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
  const notes = data?.details?.notes;

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

          <Box className="absolute inset-x-0 bottom-0 -mb-5 px-5">
            <CTA isOwner={!!isOwner} status={status} />
          </Box>
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
                {remainingVolume} mL available
              </Text>
            </>
          )}
        </VStack>

        <Divider />

        <HStack space="2xl" className="flex-wrap items-center p-5">
          <StorageTypeTag isLoading={isLoading} data={data} />
          <CollectionMethodTag isLoading={isLoading} data={data} />
        </HStack>

        <VStack className="mb-5 px-5">
          <Text className="font-JakartaSemiBold mb-1">Notes</Text>
          {isLoading ? (
            <Skeleton className="h-20" />
          ) : (
            <Textarea size="sm" pointerEvents="none">
              <TextareaInput
                defaultValue={notes || ''}
                placeholder="No notes provided."
                editable={false}
                style={{ textAlignVertical: 'top' }}
              />
            </Textarea>
          )}
        </VStack>

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

interface PreferenceListProps extends ComponentProps<typeof VStack> {
  data: DeliveryPreference[];
  isLoading?: boolean;
}

function PreferenceList({ data, isLoading, ...props }: PreferenceListProps) {
  if (!isLoading && data.length === 0) {
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
          return (
            <Link asChild push href={`/delivery-preferences/${item.id}`}>
              <AnimatedPressable className="overflow-hidden rounded-2xl">
                <DeliveryPreferenceCard
                  appearance="compact"
                  preference={item}
                  isLoading={isLoading}
                />
              </AnimatedPressable>
            </Link>
          );
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
  if (!isLoading && data.length === 0) {
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
}
function CTA({ isOwner, status }: CTAProps) {
  const isEditable =
    status &&
    (
      [DONATION_REQUEST_STATUS.PENDING.value, DONATION_REQUEST_STATUS.AVAILABLE.value] as string[]
    ).includes(status);

  const isDeletable =
    status &&
    (
      [DONATION_REQUEST_STATUS.EXPIRED.value, DONATION_REQUEST_STATUS.CANCELLED.value] as string[]
    ).includes(status);

  return (
    <HStack space="md" className="items-center justify-end">
      <Button action="muted" className="h-fit w-fit rounded-full p-3">
        <ButtonIcon as={MessageCircleIcon} />
      </Button>
      <Button action="muted" className="h-fit w-fit rounded-full p-3">
        <ButtonIcon as={ShareIcon} />
      </Button>

      <Popover
        placement="top left"
        offset={2}
        trigger={(props) => (
          <Button {...props} action="muted" className="h-fit w-fit rounded-full p-3">
            <ButtonIcon as={ThreeDotsIcon} />
          </Button>
        )}
      >
        <PopoverBackdrop />
        <PopoverContent className="flex-col p-2">
          {isOwner ? (
            <>
              {isEditable && (
                <Pressable className="flex-row items-center overflow-hidden rounded-md p-2">
                  <Icon as={EditIcon} size="sm" className="mr-2" />
                  <Text size="sm">Edit</Text>
                </Pressable>
              )}
              {isDeletable && (
                <Pressable className="flex-row items-center overflow-hidden rounded-md p-2">
                  <Icon as={Trash2Icon} size="sm" className="text-error-500 mr-2" />
                  <Text size="sm" className="text-error-500">
                    Delete
                  </Text>
                </Pressable>
              )}
            </>
          ) : (
            <>
              {isEditable && (
                <Pressable className="flex-row items-center overflow-hidden rounded-md p-2">
                  <Icon as={XCircleIcon} size="sm" className="text-error-500 mr-2" />
                  <Text size="sm" className="text-error-500">
                    Cancel
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </PopoverContent>
      </Popover>
    </HStack>
  );
}

// #endregion Components
