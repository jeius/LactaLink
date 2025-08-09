import { MapView } from '@/components/map/MapView';
import { Box } from '@/components/ui/box';

import { MapBottomSheet, MapBottomSheetProps } from '@/components/map/MapBottomSheet';

import { MapProvider } from '@/components/contexts/MapProvider';
import { DataMarkers } from '@/components/map/markers/DataMarkers';
import { useFetchNearest } from '@/hooks/collections/useFetchNearest';
import { MarkerPressEvent } from '@/lib/types/markers';
import { Donation, Request } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities';
import _ from 'lodash';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import RNMapView, { LatLng, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MemoizedMapView = memo(MapView, (prevProps, nextProps) => _.isEqual(prevProps, nextProps));

export default function MapPage() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<RNMapView>(null);
  const [selectedItem, setSelectedItem] = useState<MapBottomSheetProps['value']>();
  const [region, setRegion] = useState<Region>();

  const nearestDonationRes = useFetchNearest('donations');
  const nearestRequestRes = useFetchNearest('requests');

  const dataReady = nearestDonationRes.isSuccess && nearestRequestRes.isSuccess;

  const donations = useMemo(() => {
    return nearestDonationRes.data?.pages.flatMap((page) => page?.docs || []) || [];
  }, [nearestDonationRes.data]);

  const requests = useMemo(() => {
    return nearestRequestRes.data?.pages.flatMap((page) => page?.docs || []) || [];
  }, [nearestRequestRes.data]);

  function handleSelectionChange(value?: NonNullable<MapBottomSheetProps['value']>) {
    const { data } = value || {};
    let coord: LatLng | undefined;

    if (data && ('donor' in data || 'requester' in data)) {
      const preference = extractCollection(data.deliveryPreferences)?.[0];
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

  function handleDonationMarkerPress(event: MarkerPressEvent<Donation>) {
    const { data } = event;
    setSelectedItem?.({ data, slug: 'donations' });
  }

  function handleRequestMarkerPress(event: MarkerPressEvent<Request>) {
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
            <DataMarkers
              showAvatar
              data={selectedItem.data}
              onPress={handleDonationMarkerPress}
              colorTheme="primary"
            />
          ) : selectedItem.slug === 'requests' ? (
            <DataMarkers
              showAvatar
              data={selectedItem.data}
              onPress={handleRequestMarkerPress}
              colorTheme="tertiary"
            />
          ) : null}
        </>
      );
    }

    return (
      <>
        {donations?.map((donation, i) => (
          <DataMarkers
            key={`${donation.id}-${i}`}
            data={donation}
            region={region}
            onPress={handleDonationMarkerPress}
            showAvatar={false}
            colorTheme="primary"
          />
        ))}

        {requests?.map((request, i) => (
          <DataMarkers
            key={`${request.id}-${i}`}
            data={request}
            region={region}
            onPress={handleRequestMarkerPress}
            showAvatar={false}
            colorTheme="tertiary"
          />
        ))}
      </>
    );
  }, [selectedItem, dataReady, donations, requests, region]);

  return (
    <MapProvider mapRef={mapRef}>
      <Box style={{ flex: 1, marginBottom: insets.bottom }}>
        <MemoizedMapView dataReady={dataReady} onRegionChangeComplete={handleRegionChangeComplete}>
          {mapChildren}
        </MemoizedMapView>

        <MapBottomSheet
          value={selectedItem}
          onChange={handleSelectionChange}
          donationQueryResult={nearestDonationRes}
          requestQueryResult={nearestRequestRes}
        />
      </Box>
    </MapProvider>
  );
}
