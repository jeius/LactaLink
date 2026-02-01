import PressableWrapper from '@/components/buttons/PressableWrapper';
import { useSelectedDataMarker } from '@/components/contexts/markers/DataMarker';
import DonationCard, {
  DonationCardSkeleton,
} from '@/features/donation&request/components/cards/DonationCard';
import { useCurrentCoordinates } from '@/lib/stores';
import { ListRenderItem } from '@/lib/types';
import { getMinDistance } from '@/lib/utils/getMinDistance';
import { getNearestDeliveryPreference } from '@/lib/utils/getNearestDeliveryPreference';
import { createMarkerID } from '@/lib/utils/markerUtils';
import { Donation } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { validatePoint } from '@lactalink/utilities/geo-utils';
import { useRouter } from 'expo-router';
import { MapPinIcon } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { NearestDonationsList } from './lists/NearestListings';

type TData = Donation;

const slug: Extract<CollectionSlug, 'donations'> = 'donations';

export default function ExploreDonationsTab() {
  const router = useRouter();

  const setSelectedMarker = useSelectedDataMarker()[1];
  const coordinates = useCurrentCoordinates();

  const handlePress = useCallback(
    (data: TData) => {
      const nearest = getNearestDeliveryPreference(extractCollection(data.deliveryPreferences));
      const address = extractCollection(nearest?.deliveryPreference?.address);
      const coordinates = address?.coordinates;

      if (validatePoint(coordinates)) {
        const markerID = createMarkerID(slug, data.id, coordinates);
        setSelectedMarker(markerID);
        router.push(`/map/explore/marker/${markerID}`);
      }
    },
    [router, setSelectedMarker]
  );

  const renderItem: ListRenderItem<TData> = useCallback(
    ({ item, isPlaceholder }) => {
      if (isPlaceholder) return <DonationCardSkeleton />;

      const { deliveryPreferences } = item;
      const preferences = extractCollection(deliveryPreferences);
      const minDistance = getMinDistance(preferences, coordinates);
      const label = minDistance ? `${minDistance.toFixed(2)} km` : undefined;

      return (
        <PressableWrapper
          label={label}
          icon={MapPinIcon}
          className="overflow-hidden rounded-2xl"
          onPress={() => handlePress(item)}
        >
          <DonationCard data={item} />
        </PressableWrapper>
      );
    },
    [coordinates, handlePress]
  );

  return (
    <NearestDonationsList
      renderItem={renderItem}
      useBottomSheetListComponent
      title="Available Donations"
    />
  );
}
