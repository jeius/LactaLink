import { Donation, Request } from '@lactalink/types/payload-generated-types';

import PressableWrapper from '@/components/buttons/PressableWrapper';
import { useCurrentCoordinates } from '@/lib/stores';
import { ListRenderItem } from '@/lib/types';
import { SceneProps } from '@/lib/types/tab-types';
import { getMinDistance } from '@/lib/utils/getMinDistance';
import { extractCollection } from '@lactalink/utilities/extractors';
import { isDonation } from '@lactalink/utilities/type-guards';
import { useRouter } from 'expo-router';
import { MapPinIcon } from 'lucide-react-native';
import React, { useCallback } from 'react';
import DonationCard, { DonationCardSkeleton } from './cards/DonationCard';
import RequestCard from './cards/RequestCard';
import { NearestDonationsList, NearestRequestsList } from './lists/NearestListings';

export function DonationRequestScene({ route }: SceneProps) {
  const router = useRouter();

  const coordinates = useCurrentCoordinates();
  const isDonationKey = route.key === 'donations';
  const isRequestKey = route.key === 'requests';

  const handlePress = useCallback(
    (data: Donation | Request) => {
      router.push(`/${route.key as 'donations' | 'requests'}/${data.id}`);
    },
    [route.key, router]
  );

  const renderItem: ListRenderItem<Donation | Request> = useCallback(
    ({ item, isPlaceholder }) => {
      if (isPlaceholder) return <DonationCardSkeleton />;

      const { deliveryPreferences } = item;
      const preferences = extractCollection(deliveryPreferences);
      const minDistance = getMinDistance(preferences, coordinates);
      const label = minDistance ? `${minDistance.toFixed(2)} km` : undefined;

      if (isDonation(item)) {
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
      } else {
        return (
          <PressableWrapper
            label={label}
            icon={MapPinIcon}
            className="overflow-hidden rounded-2xl"
            onPress={() => handlePress(item)}
          >
            <RequestCard data={item} />
          </PressableWrapper>
        );
      }
    },
    [coordinates, handlePress]
  );

  if (isDonationKey) {
    return <NearestDonationsList renderItem={renderItem} hideRefreshButton />;
  } else if (isRequestKey) {
    return <NearestRequestsList renderItem={renderItem} hideRefreshButton />;
  } else {
    return null;
  }
}
