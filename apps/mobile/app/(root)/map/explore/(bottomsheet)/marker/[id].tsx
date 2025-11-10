import { DeliveryPreferenceCard, DonationInfoCard } from '@/components/cards';
import { RequestInfoCard } from '@/components/cards/RequestInfoCard';
import { useMap } from '@/components/contexts/MapProvider';
import {
  useDataMarkerActions,
  useDataMarkersMap,
  useSelectedDataMarker,
} from '@/components/contexts/markers/DataMarker';
import { DataMarkerSlug } from '@/components/contexts/markers/types';
import { BottomSheetScrollView } from '@/components/ui/bottom-sheet';
import { useBottomSheetActions, useBottomSheetRef } from '@/components/ui/bottom-sheet/context';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { getColor } from '@/lib/colors';
import { createMarkerID, destructureMarkerID } from '@/lib/utils/markerUtils';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { validatePoint } from '@lactalink/utilities/geo-utils';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { MapIcon } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';

type Slug = Extract<CollectionSlug, 'donations' | 'requests' | 'hospitals' | 'milkBanks'>;

export default function SelectedDataMarkerPage() {
  const { id: markerID } = useLocalSearchParams<{ id: string }>();

  const [map] = useMap();
  const markerMap = useDataMarkersMap();
  const { addMarker, setSelectedMarker } = useDataMarkerActions();
  const { handleOpen: openBottomSheet } = useBottomSheetActions();

  const dataMarker = useMemo(() => markerMap.get(markerID), [markerMap, markerID]);

  const destructured = destructureMarkerID(markerID);

  const query = useFetchById(!dataMarker || !!destructured, {
    collection: (destructured?.slug ?? 'donations') as DataMarkerSlug,
    id: destructured?.id ?? '',
  });

  const data = dataMarker ? dataMarker.data.value : query.data;

  const { slug, title, preferences } = useMemo(() => {
    if (!data) return {};

    let slug: Slug = 'donations';
    let title = 'Donation Details';
    let preferences: DeliveryPreference[] = [];

    if (isDonation(data)) {
      slug = 'donations';
      title = 'Donation Details';
      preferences = extractCollection(data.deliveryPreferences) || [];
    } else if (isRequest(data)) {
      slug = 'requests';
      title = 'Request Details';
      preferences = extractCollection(data.deliveryPreferences) || [];
    }
    return { slug, title, preferences };
  }, [data]);

  useFocusEffect(
    useCallback(() => {
      // Ensure the data marker is added to the context
      if (!dataMarker && query.data) addMarker(query.data);
      // Set the selected marker in context
      setSelectedMarker(markerID);
      // Show the marker info window on the map
      map?.showMarkerInfoWindow(markerID);
      // Open the bottom sheet to show marker details
      openBottomSheet();
      // On unFocus, clear the selected marker and hide the info window
      return () => {
        setSelectedMarker(null);
        map?.hideMarkerInfoWindow(markerID);
      };
    }, [dataMarker, map, markerID, query.data, addMarker, setSelectedMarker, openBottomSheet])
  );

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'card',
          contentStyle: { backgroundColor: getColor('background', '0') },
        }}
      />
      <BottomSheetScrollView>
        <VStack space="sm" className="mb-10 items-stretch p-4">
          <Text className="font-JakartaSemiBold">{title}</Text>
          {data &&
            (isDonation(data) ? (
              <DonationInfoCard data={data} />
            ) : isRequest(data) ? (
              <RequestInfoCard data={data} />
            ) : null)}

          {preferences && data?.id && (
            <>
              <Text className="mt-4 font-JakartaSemiBold">Delivery Preferences</Text>
              <DPList slug={slug} id={data.id} data={preferences} />
            </>
          )}
        </VStack>
      </BottomSheetScrollView>
    </>
  );
}

function DPList({
  data: prefs,
  slug,
  id,
}: {
  data: DeliveryPreference[];
  id: string;
  slug: Extract<CollectionSlug, 'donations' | 'requests'>;
}) {
  const [map] = useMap();
  const setSelectedMarker = useSelectedDataMarker()[1];
  const bottomSheetRef = useBottomSheetRef();

  return prefs.map((preference, i) => {
    async function handleViewOnMap() {
      const point = extractCollection(preference.address)?.coordinates;
      if (!validatePoint(point)) return;

      const [longitude, latitude] = point;
      const markerID = createMarkerID(slug, id, point);
      setSelectedMarker(markerID);
      map?.setCamera({ center: { latitude, longitude }, zoom: 16 }, false);
      map?.showMarkerInfoWindow(markerID);
      bottomSheetRef?.current?.collapse();
    }

    return (
      <Card key={i} className="relative flex-col gap-4">
        <DeliveryPreferenceCard preference={preference} variant="ghost" className="p-0" />

        <Button size="sm" variant="outline" onPress={handleViewOnMap}>
          <ButtonIcon as={MapIcon} />
          <ButtonText>View on Map</ButtonText>
        </Button>
      </Card>
    );
  });
}
