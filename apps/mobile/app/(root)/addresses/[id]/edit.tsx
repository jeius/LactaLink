import React, { useRef } from 'react';

import { AddressMapBottomSheet } from '@/components/bottom-sheets/AddressMapBottomSheet';
import { Form } from '@/components/contexts/FormProvider';
import FormPreventBack from '@/components/forms/FormPreventBack';
import { GooglePlacesInput, LocationDetails } from '@/components/GooglePlacesInput';
import { AddressMapView } from '@/components/map/AddressMapView';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { useUpdateAddressMutation } from '@/features/address/hooks/useUpdateAddressMutation';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { useAddressForm } from '@/hooks/forms/useAddressForm';
import { AddressSchema } from '@lactalink/form-schemas';
import { ErrorSearchParams } from '@lactalink/types';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { RNCamera, RNRegion } from 'react-native-google-maps-plus';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import MapView from 'react-native-maps';
import { toast } from 'sonner-native';

export default function EditAddressPage() {
  const router = useRouter();

  const revalidateQueries = useRevalidateCollectionQueries();

  const { id } = useLocalSearchParams<{ id: string }>();

  const mapRef = useRef<MapView | null>(null);
  const googlePlacesInputRef = useRef<GooglePlacesAutocompleteRef | null>(null);

  const form = useAddressForm(id);
  const { isLoading, fetchError: error, extraData: data, setValue } = form;

  const { mutateAsync } = useUpdateAddressMutation();

  const coordinates = (data?.coordinates && pointToLatLng(data.coordinates)) || undefined;

  async function onSubmit(formData: AddressSchema) {
    const promise = mutateAsync(formData);

    toast.promise(promise, {
      loading: 'Updating address...',
      success: (data: Address) => `"${data.name || 'Address'}" updated successfully.`,
      error: (err) => extractErrorMessage(err) || 'Failed to update address.',
    });

    await promise;

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

  function handleCameraChangeComplete(_: RNRegion, camera: RNCamera, isGesture: boolean) {
    if (isGesture && camera?.center) {
      setValue('coordinates', camera.center, { shouldDirty: true, shouldTouch: true });
    }
  }

  if (!id) {
    return <Redirect href="/+not-found" />;
  }

  return (
    <Form {...form}>
      <FormPreventBack />

      <SafeArea safeTop={false} mode="margin" className="items-stretch">
        <AddressMapView
          mapPadding={{ left: 4, right: 4, top: 40 + 16, bottom: 32 }}
          onCameraChangeComplete={handleCameraChangeComplete}
          isLoading={isLoading}
          coordinates={coordinates}
          onMapPress={blurInput}
        >
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
        </AddressMapView>
      </SafeArea>
    </Form>
  );
}
