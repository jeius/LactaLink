import { useMap, useMapZoomLevel } from '@/components/contexts/MapProvider';
import { useDataMarkerActions } from '@/components/contexts/markers/DataMarker';
import { DataMarker } from '@/components/contexts/markers/types';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { BasicLocationPin } from '@/components/ui/icon/custom';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { getColor } from '@/lib/colors';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { EditIcon, XIcon } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SearchParams = { id: string };

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function ExploreAddressInfo() {
  const { data: meUser } = useMeUser();
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const { id } = useLocalSearchParams<SearchParams>();

  const [map] = useMap();
  const zoomLevel = useMapZoomLevel();
  const { addMarker, removeMarker, setSelectedMarker } = useDataMarkerActions();
  // const { setDataMarker: setAddressDataMarker } = useAddressMarkerActions();
  // const { dataMarker } = useAddressMarker();
  const [dataMarker, setAddressDataMarker] = useState<DataMarker | null>(null);

  const { data: address, isLoading } = useFetchById(!!id, {
    collection: 'addresses',
    id: id,
  });

  const street = address?.street || 'Unknown street';
  const brngy = extractCollection(address?.barangay)?.name;
  const city = extractCollection(address?.cityMunicipality)?.name;
  const province = extractCollection(address?.province)?.name;
  const zip = address?.zipCode;
  const isOwner = extractID(meUser) === extractID(address?.owner);

  const handleClose = useCallback(() => {
    router.replace('/map/explore/donations');
    if (dataMarker) {
      removeMarker(dataMarker.marker.id);
    }
  }, [dataMarker, removeMarker, router]);

  const moveToMarker = useCallback(() => {
    if (!address?.coordinates) return;
    const center = pointToLatLng(address.coordinates);
    map?.setCamera({ center, zoom: Math.max(16, zoomLevel.value) }, true, 300);
  }, [address, map, zoomLevel]);

  // useEffect(() => {
  //   if (!address?.coordinates) return;

  //   const dataMarker = addMarker(address);
  //   if (Array.isArray(dataMarker)) return;

  //   setAddressDataMarker(dataMarker);
  //   setSelectedMarker(dataMarker?.marker.id || null);

  //   // Update the map camera to focus on the marker
  //   moveToMarker();

  //   return () => setSelectedMarker(null);
  // }, [addMarker, address, map, moveToMarker, setAddressDataMarker, setSelectedMarker]);

  useFocusEffect(
    useCallback(() => {
      if (!address?.coordinates) return;

      const dataMarker = addMarker(address);
      if (Array.isArray(dataMarker)) return;

      setAddressDataMarker(dataMarker);
      setSelectedMarker(dataMarker?.marker.id || null);

      // Update the map camera to focus on the marker
      moveToMarker();

      return () => setSelectedMarker(null);
    }, [addMarker, address, moveToMarker, setSelectedMarker])
  );

  if (isLoading) {
    return (
      <Box className="flex-1 items-center justify-center">
        <Box className="absolute inset-0 bg-background-0" style={{ opacity: 0.7 }} />
        <Spinner size={'large'} />
        <Text>Loading address...</Text>
      </Box>
    );
  }

  return (
    <VStack
      space="lg"
      pointerEvents="box-none"
      className="flex-1 items-stretch justify-between p-4"
      style={{ marginTop: insets.top }}
    >
      <Box className="self-start overflow-hidden rounded-full">
        <Box className="absolute inset-0 bg-background-100" style={{ opacity: 0.75 }} />
        <HeaderBackButton disablePressAnimation={false} tintColor={getColor('typography', '900')} />
      </Box>

      <Pressable onPress={moveToMarker}>
        <AnimatedCard entering={FadeInDown} exiting={FadeOutDown} className="p-4">
          {isLoading ? (
            <HStack space="sm" className="w-full">
              <Skeleton variant="rounded" className="h-12 w-12" />
              <VStack className="flex-1">
                <Skeleton variant="rounded" className="mb-1 h-4 w-2/3" />
                <Skeleton variant="circular" className="mb-1 h-3 w-full" />
                <Skeleton variant="circular" className="h-3 w-2/3" />
              </VStack>
            </HStack>
          ) : (
            <HStack space="sm" className="w-full">
              <Box className="p-2">
                <Icon as={BasicLocationPin} className="h-8 w-8 fill-primary-500" />
              </Box>
              <VStack className="flex-1 items-start">
                <HStack space="sm" className="items-start">
                  <Text className="grow font-JakartaMedium">{street}</Text>
                  <Button
                    size="sm"
                    variant="link"
                    action="default"
                    className="h-fit w-fit p-0"
                    hitSlop={8}
                    onPress={handleClose}
                  >
                    <ButtonIcon as={XIcon} />
                  </Button>
                </HStack>

                <Text size="sm" className="text-typography-800">
                  {[brngy, city, zip, province].filter(Boolean).join(', ')}
                </Text>

                {isOwner && (
                  <Link href={`/addresses/${id}/edit`} asChild>
                    <Button size="sm" variant="outline" className="mt-2">
                      <ButtonIcon as={EditIcon} />
                      <ButtonText>Edit Address</ButtonText>
                    </Button>
                  </Link>
                )}
              </VStack>
            </HStack>
          )}
        </AnimatedCard>
      </Pressable>
    </VStack>
  );
}
