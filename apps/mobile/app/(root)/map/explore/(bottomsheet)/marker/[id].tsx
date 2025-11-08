import { DeliveryPreferenceCard, DonationInfoCard } from '@/components/cards';
import { RequestInfoCard } from '@/components/cards/RequestInfoCard';
import {
  createMarkerID,
  destructureMarkerID,
  useDataMarkerMap,
  useSelectedDataMarker,
} from '@/components/contexts/DataMarkerProvider';
import { useMap } from '@/components/contexts/MapProvider';
import { BottomSheetScrollView } from '@/components/ui/bottom-sheet';
import { useBottomSheetRef } from '@/components/ui/bottom-sheet/context';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { getColor } from '@/lib/colors';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { validatePoint } from '@lactalink/utilities/geo-utils';
import { isDonation, isRequest } from '@lactalink/utilities/type-guards';
import { Stack, useLocalSearchParams } from 'expo-router';
import { MapIcon } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';

type Slug = Extract<CollectionSlug, 'donations' | 'requests' | 'hospitals' | 'milkBanks'>;

export default function SelectedDataMarkerPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [map] = useMap();
  const markerMap = useDataMarkerMap();

  const dataMarker = useMemo(() => markerMap.get(id), [markerMap, id]);

  const destructured = destructureMarkerID(id);

  const query = useFetchById(!dataMarker || !!destructured, {
    collection: destructured?.slug ?? 'donations',
    id: destructured?.id ?? '',
  });

  const data = dataMarker ? dataMarker.data : query.data;

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

  useEffect(() => {
    if (dataMarker) {
      const marker = dataMarker.marker;
      map?.setCamera({ center: marker.coordinate }, false);
      map?.showMarkerInfoWindow(marker.id);

      return () => {
        map?.hideMarkerInfoWindow(marker.id);
      };
    }
    return () => {};
  }, [map, id, dataMarker]);

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
