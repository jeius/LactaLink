import React, { useRef, useState } from 'react';
import { FormProvider } from 'react-hook-form';

import { AddressMapBottomSheet } from '@/components/bottom-sheets/AddressMapBottomSheet';
import FormPreventBack from '@/components/forms/FormPreventBack';
import { GooglePlacesInput, LocationDetails } from '@/components/GooglePlacesInput';
import { AddressMapView } from '@/components/map/AddressMapView';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { useAddressForm } from '@/hooks/forms/useAddressForm';
import { upsertAddress } from '@/lib/api/upsert';
import { ErrorSearchParams } from '@lactalink/types';
import { AddressSchema } from '@lactalink/types/forms';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { TouchableWithoutFeedback } from 'react-native';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import MapView, { Region } from 'react-native-maps';

export default function EditPage() {
  const router = useRouter();

  const revalidateQueries = useRevalidateCollectionQueries();

  const { id } = useLocalSearchParams<{ id?: string }>();

  const [selectedRegion, setSelectedRegion] = useState<Region>();

  const mapRef = useRef<MapView | null>(null);
  const googlePlacesInputRef = useRef<GooglePlacesAutocompleteRef | null>(null);

  const { form, isLoading, error } = useAddressForm(id);

  const { coordinates } = form.watch();

  async function onSubmit(formData: AddressSchema) {
    if (selectedRegion) {
      const { latitude, longitude } = selectedRegion;
      formData.coordinates = { latitude, longitude };
    }

    const success = await upsertAddress(formData);

    if (!success) return;

    revalidateQueries(['addresses', 'users']);
    form.reset(formData);
    router.back();
  }

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  function handleSearchSelected({ location }: LocationDetails) {
    mapRef.current?.animateCamera({ center: location }, { duration: 500 });
  }

  function blurInput() {
    googlePlacesInputRef.current?.blur();
  }

  function handleRegionChange(region: Region) {
    setSelectedRegion(region);
  }

  if (!id) {
    return <Redirect href="/+not-found" />;
  }

  return (
    <FormProvider {...form}>
      <FormPreventBack />

      <SafeArea safeTop={false} mode="margin">
        <TouchableWithoutFeedback onPress={blurInput} touchSoundDisabled>
          <AddressMapView
            mapRef={mapRef}
            isLoading={isLoading}
            onRegionChangeComplete={handleRegionChange}
            coordinates={coordinates}
          />
        </TouchableWithoutFeedback>

        <Box className="absolute inset-x-0 p-4">
          <GooglePlacesInput
            inputRef={googlePlacesInputRef}
            rounded="full"
            onSelected={handleSearchSelected}
          />
        </Box>

        <AddressMapBottomSheet onSavePress={form.handleSubmit(onSubmit)} isLoading={isLoading} />
      </SafeArea>
    </FormProvider>
  );
}
