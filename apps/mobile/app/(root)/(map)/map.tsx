import { MapView } from '@/components/map/MapView';
import { Box } from '@/components/ui/box';

import { DONATION_STATUS } from '@/lib/constants';

import { MapBottomSheet, MapBottomSheetProps } from '@/components/map/MapBottomSheet';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { Address, DeliveryPreference, Populate } from '@lactalink/types';

import {
  DonationMarkerPressEvent,
  DonationMarkers,
} from '@/components/map/markers/DonationMarkers';
import { RequestMarkerPressEvent, RequestMarkers } from '@/components/map/markers/RequestMarkers';
import React, { useRef, useState } from 'react';
import RNMapView, { Details, LatLng, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MapPage() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<RNMapView>(null);
  const [selectedItem, setSelectedItem] = useState<MapBottomSheetProps['value']>();
  const [region, setRegion] = useState<Region>();

  const populate: Populate = {
    users: { profile: true },
    addresses: { coordinates: true, displayName: true },
    'delivery-preferences': { address: true, availableDays: true, preferredMode: true },
  };

  const donationRes = useFetchBySlug(true, {
    collection: 'donations',
    where: { status: { in: [DONATION_STATUS.available.value, DONATION_STATUS.partially.value] } },
    populate,
  });

  const requestRes = useFetchBySlug(true, {
    collection: 'requests',
    where: { status: { equals: 'PENDING' } },
    populate,
  });

  const dataReady = donationRes.isSuccess && requestRes.isSuccess;

  const { data: donations } = donationRes;
  const { data: requests } = requestRes;

  async function handleSelectionChange(value?: NonNullable<MapBottomSheetProps['value']>) {
    const { data } = value || {};
    let coord: LatLng | undefined;

    if (data && ('donor' in data || 'requester' in data)) {
      const preference = data.deliveryDetails[0] as DeliveryPreference | undefined;
      const point = (preference?.address as Address)?.coordinates;
      if (point && point.length === 2) {
        coord = { latitude: point[0], longitude: point[1] };
      }
    }

    if (coord && mapRef.current) {
      const camera = await mapRef.current.getCamera();

      mapRef.current.animateCamera({
        ...camera,
        center: { latitude: coord.latitude || 0, longitude: coord.longitude || 0 },
      });
    }
    setSelectedItem(value);
  }

  function handleDonationMarkerPress(event: DonationMarkerPressEvent) {
    const { data } = event;
    setSelectedItem?.({ data, slug: 'donations' });
  }

  function handleRequestMarkerPress(event: RequestMarkerPressEvent) {
    const { data } = event;
    setSelectedItem?.({ data, slug: 'requests' });
  }

  function handleRegionChange(region: Region, _details: Details) {
    setRegion(region);
  }

  return (
    <Box style={{ flex: 1, marginBottom: insets.bottom }}>
      <MapView mapRef={mapRef} dataReady={dataReady} onRegionChangeComplete={handleRegionChange}>
        {selectedItem ? (
          <>
            {selectedItem.slug === 'donations' ? (
              <DonationMarkers data={selectedItem.data} onPress={handleDonationMarkerPress} />
            ) : selectedItem.slug === 'requests' ? (
              <RequestMarkers data={selectedItem.data} onPress={handleRequestMarkerPress} />
            ) : null}
          </>
        ) : (
          <>
            {donations?.map((donation, i) => (
              <DonationMarkers
                key={`${donation.id}-${i}`}
                data={donation}
                region={region}
                onPress={handleDonationMarkerPress}
              />
            ))}

            {requests?.map((request, i) => (
              <RequestMarkers
                key={`${request.id}-${i}`}
                data={request}
                region={region}
                onPress={handleRequestMarkerPress}
              />
            ))}
          </>
        )}
      </MapView>

      <MapBottomSheet
        value={selectedItem}
        onChange={handleSelectionChange}
        donationQueryResult={donationRes}
        requestQueryResult={requestRes}
        mapRef={mapRef}
      />
    </Box>
  );
}
