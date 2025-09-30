import React from 'react';

import SafeArea from '@/components/SafeArea';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { ErrorSearchParams } from '@lactalink/types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';

import { Image } from '@/components/Image';
import { ThumbnailMap } from '@/components/map/ThumbnailMap';
import { RefreshControl } from '@/components/RefreshControl';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { MapPageSearchParams } from '@/lib/types';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { DAYS, DELIVERY_OPTIONS } from '@lactalink/enums';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { Motion } from '@legendapp/motion';
import { Link, Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDaysIcon, Edit2Icon, MapPinIcon } from 'lucide-react-native';
import { GestureResponderEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeleteActionButton } from '@/components/buttons';

export default function DeliveryPreferencePage() {
  //#region Hooks
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data, error, isLoading, refetch, isRefetching } = useFetchById(!!id, {
    collection: 'delivery-preferences',
    id: id,
  });

  const address = extractCollection(data?.address);
  const fullAddress = address?.displayName;
  const center = pointToLatLng(address?.coordinates);

  const name = data?.name || 'Delivery Preference';

  const { preferredMode, availableDays } = data || {};

  function navigateToMap(e: GestureResponderEvent) {
    e.stopPropagation();
    if (!address || !center) return;

    const params: MapPageSearchParams = {
      adr: extractID(address),
      lat: String(center.latitude),
      lng: String(center.longitude),
    };

    router.push({ pathname: '/map/explore', params });
  }

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  //#region Render
  return (
    <SafeArea safeBottom={false} safeTop={false} className="items-stretch">
      <ScrollView
        contentContainerClassName="relative flex-1 flex-col items-stretch justify-start"
        refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
      >
        {isLoading ? (
          <PageSkeleton />
        ) : (
          <>
            <ThumbnailMap isLoading={isLoading} center={center} zoom={16} className="h-64 w-full" />

            <HStack space="lg" className="items-center p-5">
              <Text size="lg" className="font-JakartaSemiBold flex-1">
                {name}
              </Text>
              <DeleteActionButton
                slug="delivery-preferences"
                id={id}
                iconOnly
                itemName={name}
                title="Confirm Delete"
              />
            </HStack>

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
                          source={iconAsset}
                          alt={`${mode}-icon`}
                          style={{ width: 16, height: 16 }}
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
                  <Text size="sm">Location</Text>
                  <Box className="flex-1">
                    <Divider />
                  </Box>
                </HStack>
                <Button
                  animateOnPress={false}
                  variant="link"
                  action="default"
                  className="h-fit w-fit p-0"
                  onPress={navigateToMap}
                >
                  <ButtonText underlineOnPress className="flex-1">
                    {fullAddress}
                  </ButtonText>
                </Button>
              </VStack>
            )}
          </>
        )}
      </ScrollView>

      <Motion.View
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'tween', duration: 100 }}
        style={{ width: '100%' }}
      >
        <Box
          className="border-outline-300 bg-background-0 rounded-t-2xl border p-4"
          style={{ paddingBottom: insets.bottom }}
        >
          <Link href={`/delivery-preferences/${id}/edit`} push asChild>
            <Button>
              <ButtonIcon as={Edit2Icon} />
              <ButtonText>Edit Delivery Preference</ButtonText>
            </Button>
          </Link>
        </Box>
      </Motion.View>
    </SafeArea>
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
