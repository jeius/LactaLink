import { useFetchById } from '@/hooks/collections/useFetchById';
import { MapPageSearchParams } from '@/lib/types';
import { ErrorSearchParams } from '@lactalink/types/errors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function AddressPage() {
  const { id, lat, lng } = useLocalSearchParams<{ id: string; lat?: string; lng?: string }>();

  const { data, error, isLoading } = useFetchById(!lat && !lng, {
    collection: 'addresses',
    id,
  });

  if (lat && lng) {
    const params: MapPageSearchParams = { adr: id, lat, lng };
    return <Redirect href={{ pathname: '/map/explore', params }} />;
  }

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  const coordinates = data?.coordinates && pointToLatLng(data.coordinates);

  if (!coordinates) {
    const params: MapPageSearchParams = { adr: id };
    return <Redirect href={{ pathname: '/map/explore', params }} />;
  }

  const params: MapPageSearchParams = {
    adr: id,
    lat: String(coordinates.latitude),
    lng: String(coordinates.longitude),
  };

  return <Redirect href={{ pathname: '/map/explore', params }} />;
}
