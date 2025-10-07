import React, { useRef } from 'react';
import { FormProvider } from 'react-hook-form';
import { TouchableWithoutFeedback } from 'react-native';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import MapView, { Region } from 'react-native-maps';

import { AddressMapBottomSheet } from '@/components/bottom-sheets/AddressMapBottomSheet';
import FormPreventBack from '@/components/forms/FormPreventBack';
import { GooglePlacesInput, LocationDetails } from '@/components/GooglePlacesInput';
import { AddressMapView } from '@/components/map/AddressMapView';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { useAddressForm } from '@/hooks/forms/useAddressForm';
import { upsertAddress } from '@/lib/api/upsert';
import { AddressSchema } from '@lactalink/form-schemas';
import { ErrorSearchParams } from '@lactalink/types';
import { Redirect, Stack, useRouter } from 'expo-router';

export default function CreatePage() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const googlePlacesInputRef = useRef<GooglePlacesAutocompleteRef | null>(null);

  const revalidateQueries = useRevalidateCollectionQueries();

  const { form, isLoading, error } = useAddressForm();

  async function onSubmit(formData: AddressSchema) {
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
    const { latitude, longitude } = region;
    form.setValue('coordinates.latitude', latitude);
    form.setValue('coordinates.longitude', longitude);
  }

  return (
    <FormProvider {...form}>
      <FormPreventBack />
      <Stack.Screen options={{ headerShown: true, headerTitle: 'New Address' }} />

      <SafeArea safeTop={false} mode="margin" className="items-stretch">
        <TouchableWithoutFeedback onPress={blurInput} touchSoundDisabled>
          <Box className="flex-1">
            <AddressMapView onRegionChangeComplete={handleRegionChange} />
          </Box>
        </TouchableWithoutFeedback>

        <Box className="absolute inset-x-0 p-4" style={{ top: 0 }}>
          <GooglePlacesInput
            inputRef={googlePlacesInputRef}
            rounded="full"
            onSelected={handleSearchSelected}
          />
        </Box>

        <AddressMapBottomSheet
          editing
          onSavePress={form.handleSubmit(onSubmit)}
          isLoading={isLoading}
        />
      </SafeArea>
    </FormProvider>
  );
}
