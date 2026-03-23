import React from 'react';

import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { ErrorSearchParams } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities/extractors';

import { ThumbnailMap } from '@/components/map/ThumbnailMap';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { DAYS, DELIVERY_OPTIONS } from '@lactalink/enums';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { Link, Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDaysIcon, Edit2Icon, MapPinIcon } from 'lucide-react-native';
import { GestureResponderEvent, ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeleteActionButton } from '@/components/buttons';
import TruncatedText from '@/components/TruncatedText';
import { Pressable } from '@/components/ui/pressable';
import ScrollView from '@/components/ui/ScrollView';
import { useDeliveryPreference } from '@/features/delivery-preference/hooks/queries';
import { MapQueryParams } from '@/features/map/lib/types';
import { createDirectionalShadow } from '@/lib/utils/shadows';

export default function DeliveryPreferenceScreen() {
  //#region Hooks
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data, error, isLoading, refetch, isRefetching } = useDeliveryPreference(id);

  const address = extractCollection(data?.address);
  const fullAddress = address?.displayName;
  const center = address?.coordinates && pointToLatLng(address?.coordinates);

  const name = data?.name || 'Delivery Preference';

  const { preferredMode, availableDays } = data || {};

  function navigateToMap(e: GestureResponderEvent) {
    e.stopPropagation();
    if (!address || !center) return;
    const { latitude, longitude } = center;
    const params: MapQueryParams = {
      lat: latitude.toString(),
      lng: longitude.toString(),
      addrID: address.id,
    };
    router.push({ pathname: '/map', params });
  }

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  //#region Render
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <DeleteActionButton
              slug="delivery-preferences"
              id={id}
              iconOnly
              itemName={name}
              title="Confirm Delete"
              variant="solid"
              className="rounded-lg p-2"
            />
          ),
        }}
      />
      <ScrollView contentContainerClassName="flex-1" refreshing={isRefetching} onRefresh={refetch}>
        {isLoading ? (
          <PageSkeleton />
        ) : (
          <>
            {center && (
              <Pressable onPress={navigateToMap}>
                <ThumbnailMap
                  isLoading={isLoading}
                  center={center}
                  zoom={16}
                  className="h-64 w-full"
                />
              </Pressable>
            )}

            <Text size="lg" bold className="px-5 py-4">
              {name}
            </Text>

            {preferredMode && (
              <HStack space="sm" className="mb-10 flex-wrap items-center justify-start px-5">
                {preferredMode.map((mode, index) => {
                  const iconAsset = getDeliveryPreferenceIcon(mode);
                  return (
                    <Card
                      key={index}
                      variant="elevated"
                      className="rounded-full border-0 px-3 py-2"
                    >
                      <HStack space="sm" className="items-center">
                        <Image
                          source={iconAsset as ImageSourcePropType}
                          alt={`${mode}-icon`}
                          size="2xs"
                        />

                        <Text className="font-JakartaMedium">{DELIVERY_OPTIONS[mode].label}</Text>
                      </HStack>
                    </Card>
                  );
                })}
              </HStack>
            )}

            {availableDays && (
              <VStack space="sm" className="mb-10 px-5">
                <HStack space="sm" className="items-center">
                  <Icon size="sm" as={CalendarDaysIcon} />
                  <Text size="sm">Available Days</Text>
                  <Box className="flex-1">
                    <Divider />
                  </Box>
                </HStack>
                <HStack space="md" className="flex-wrap items-center">
                  {availableDays.map((day) => (
                    <Card key={day} className="rounded-full border-0 px-3 py-2">
                      <Text className="font-JakartaMedium">{DAYS[day].label}</Text>
                    </Card>
                  ))}
                </HStack>
              </VStack>
            )}

            {fullAddress && (
              <VStack space="sm" className="mb-10 px-5">
                <HStack space="sm" className="items-center">
                  <Icon size="sm" as={MapPinIcon} />
                  <Text size="sm">Address</Text>
                  <Box className="flex-1">
                    <Divider />
                  </Box>
                </HStack>
                <TruncatedText size="md" className="font-JakartaMedium">
                  {fullAddress}
                </TruncatedText>
              </VStack>
            )}
          </>
        )}
      </ScrollView>

      <Box
        className="rounded-t-2xl border border-outline-300 bg-background-0 p-4"
        style={{ paddingBottom: insets.bottom, ...createDirectionalShadow('top') }}
      >
        <Link href={`/delivery-preferences/${id}/edit`} push asChild>
          <Button>
            <ButtonIcon as={Edit2Icon} />
            <ButtonText>Edit Delivery Preference</ButtonText>
          </Button>
        </Link>
      </Box>
    </>
  );
  //#endregion
}

//#region PageSkeleton
function PageSkeleton() {
  return (
    <>
      <Skeleton variant="sharp" className="h-64 w-full" />

      <Skeleton variant="rounded" className="m-5 h-8 w-40" />

      <HStack space="sm" className="mb-5 flex-wrap items-center justify-start px-5">
        <Skeleton variant="circular" className="h-10 w-24" />
        <Skeleton variant="circular" className="h-10 w-24" />
        <Skeleton variant="circular" className="h-10 w-24" />
      </HStack>

      <VStack space="sm" className="mb-5 items-stretch px-5">
        <HStack space="sm" className="items-center">
          <Skeleton variant="circular" className="h-5 w-24" />
          <Box className="flex-1">
            <Divider />
          </Box>
        </HStack>
        <HStack space="md" className="flex-wrap items-center">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} variant="circular" className="h-10 w-24" />
          ))}
        </HStack>
      </VStack>

      <VStack space="sm" className="mb-5 items-stretch px-5">
        <HStack space="sm" className="items-center">
          <Skeleton variant="circular" className="h-5 w-16" />
          <Box className="flex-1">
            <Divider />
          </Box>
        </HStack>
        <Skeleton variant="rounded" className="h-6 w-full" />
      </VStack>
    </>
  );
}
//#endregion
