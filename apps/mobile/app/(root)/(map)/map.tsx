import { MapView } from '@/components/map/MapView';
import { Box } from '@/components/ui/box';

import {
  DONATION_REQUEST_STATUS,
  DONATION_VOLUME_STATUS,
  REQUEST_VOLUME_STATUS,
} from '@/lib/constants';

import { MapBottomSheet, MapBottomSheetProps } from '@/components/map/MapBottomSheet';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { Populate, Where } from '@lactalink/types';

import {
  DonationMarkerPressEvent,
  DonationMarkers,
} from '@/components/map/markers/DonationMarkers';
import { RequestMarkerPressEvent, RequestMarkers } from '@/components/map/markers/RequestMarkers';
import { useCurrentLocation } from '@/hooks/location/useLocation';
import { extractCollection } from '@lactalink/utilities';
import _ from 'lodash';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import RNMapView, { LatLng, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MemoizedMapView = memo(MapView, (prevProps, nextProps) => _.isEqual(prevProps, nextProps));

const NEAREST_RADIUS = 1000; // 1km radius

export default function MapPage() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<RNMapView>(null);
  const [selectedItem, setSelectedItem] = useState<MapBottomSheetProps['value']>();
  const [region, setRegion] = useState<Region>();

  const { location } = useCurrentLocation();
  const point = useMemo(() => {
    if (location) {
      return [location.coords.longitude, location.coords.latitude, NEAREST_RADIUS];
    }
    return undefined;
  }, [location]);

  // #region TODO: Not sure if this is correct since the deliveryPreferences field is an array.
  // Need further evaluation.
  const sortByNearest: Where = { 'deliveryPreferences.address.coordinates': { near: point } };
  // #endregion

  const donationsWhere: Where = {
    and: [
      { status: { equals: DONATION_REQUEST_STATUS.AVAILABLE } },
      { volumeStatus: { not_equals: DONATION_VOLUME_STATUS.FULLY_ALLOCATED } },
      sortByNearest,
    ],
  };
  const requestsWhere: Where = {
    and: [
      { status: { equals: DONATION_REQUEST_STATUS.AVAILABLE } },
      { volumeStatus: { not_equals: REQUEST_VOLUME_STATUS.FULFILLED } },
      sortByNearest,
    ],
  };

  const populate: Populate = {
    users: { profile: true },
    addresses: { coordinates: true, displayName: true, name: true },
    'delivery-preferences': { address: true, availableDays: true, preferredMode: true, name: true },
  };

  const donationRes = useFetchBySlug(true, {
    collection: 'donations',
    where: donationsWhere,
    populate,
  });

  const requestRes = useFetchBySlug(true, {
    collection: 'requests',
    where: requestsWhere,
    populate,
  });

  const dataReady = donationRes.isSuccess && requestRes.isSuccess;

  const { data: donations } = donationRes;
  const { data: requests } = requestRes;

  function handleSelectionChange(value?: NonNullable<MapBottomSheetProps['value']>) {
    const { data } = value || {};
    let coord: LatLng | undefined;

    if (data && ('donor' in data || 'requester' in data)) {
      const preference = extractCollection(data.deliveryPreferences)[0];
      const point = extractCollection(preference?.address)?.coordinates;
      if (point && point.length === 2) {
        const [longitude, latitude] = point;
        coord = { longitude, latitude };
      }
    }

    if (coord && mapRef.current) {
      const center: LatLng = { latitude: coord.latitude, longitude: coord.longitude };
      mapRef.current.animateCamera({ center }, { duration: 500 });
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

  const handleRegionChangeComplete = useCallback((region: Region) => {
    setRegion(region);
  }, []);

  const mapChildren = useMemo(() => {
    if (!dataReady) {
      return null;
    }

    if (selectedItem) {
      return (
        <>
          {selectedItem.slug === 'donations' ? (
            <DonationMarkers
              showAvatar
              data={selectedItem.data}
              onPress={handleDonationMarkerPress}
            />
          ) : selectedItem.slug === 'requests' ? (
            <RequestMarkers
              showAvatar
              data={selectedItem.data}
              onPress={handleRequestMarkerPress}
            />
          ) : null}
        </>
      );
    }

    return (
      <>
        {donations?.map((donation, i) => (
          <DonationMarkers
            key={`${donation.id}-${i}`}
            data={donation}
            region={region}
            onPress={handleDonationMarkerPress}
            showAvatar={false}
          />
        ))}

        {requests?.map((request, i) => (
          <RequestMarkers
            key={`${request.id}-${i}`}
            data={request}
            region={region}
            onPress={handleRequestMarkerPress}
            showAvatar={false}
          />
        ))}
      </>
    );
  }, [selectedItem, dataReady, donations, requests, region]);

  return (
    <Box style={{ flex: 1, marginBottom: insets.bottom }}>
      <MemoizedMapView
        mapRef={mapRef}
        dataReady={dataReady}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {mapChildren}
      </MemoizedMapView>

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
