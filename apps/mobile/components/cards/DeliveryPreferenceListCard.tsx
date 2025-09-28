import { useFetchById } from '@/hooks/collections/useFetchById';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import isString from 'lodash/isString';
import React, { useState } from 'react';
import { ThumbnailMap } from '../map/ThumbnailMap';
import { Card } from '../ui/card';

interface DeliveryPreferenceListCardProps {
  data?: DeliveryPreference;
  disableTapOnMap?: boolean;
  isLoading?: boolean;
}

export function DeliveryPreferenceListCard({
  data,
  disableTapOnMap,
  isLoading: isLoadingProp,
}: DeliveryPreferenceListCardProps) {
  const [isMapReady, setIsMapReady] = useState(false);

  const addressQuery = useFetchById(isString(data?.address), {
    collection: 'addresses',
    id: extractID(data?.address) || '',
    select: { name: true, displayName: true, coordinates: true, isDefault: true },
    depth: 0,
  });

  const isLoading = isLoadingProp || addressQuery.isLoading;

  const address = extractCollection(data?.address) || addressQuery.data;
  const center = pointToLatLng(address?.coordinates);

  const { preferredMode, availableDays } = data || {};

  return (
    <Card className="w-40 p-0" variant="filled">
      <ThumbnailMap isLoading={isLoading} center={center} onPress={() => {}} />
    </Card>
  );
}
