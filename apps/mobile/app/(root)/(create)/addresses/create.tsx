import React, { useRef } from 'react';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import MapView from 'react-native-maps';

import { AddressMapBottomSheet } from '@/components/bottom-sheets/AddressMapBottomSheet';
import { Form } from '@/components/contexts/FormProvider';
import FormPreventBack from '@/components/forms/FormPreventBack';
import { GooglePlacesInput, LocationDetails } from '@/components/GooglePlacesInput';
import { AddressMapView } from '@/components/map/AddressMapView';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { useAddAddressMutation } from '@/features/address/hooks/useAddAddressMutation';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { useAddressForm } from '@/hooks/forms/useAddressForm';
import { AddressCreateSchema } from '@lactalink/form-schemas';
import { ErrorSearchParams } from '@lactalink/types';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { Redirect, useRouter } from 'expo-router';
import { RNCamera, RNRegion } from 'react-native-google-maps-plus';
import { toast } from 'sonner-native';

export default function CreatePage() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);
  const googlePlacesInputRef = useRef<GooglePlacesAutocompleteRef | null>(null);

  const revalidateQueries = useRevalidateCollectionQueries();
  const { mutateAsync } = useAddAddressMutation();

  const form = useAddressForm(undefined);
  const { isLoading, fetchError: error, setValue } = form;

  async function onSubmit(formData: AddressCreateSchema) {
    const promise = mutateAsync(formData);

    toast.promise(promise, {
      loading: 'Saving address...',
      success: (data: Address) => `"${data.name || 'Address'}" created successfully.`,
      error: (err) => extractErrorMessage(err) || 'Failed to save address.',
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

  return (
    <Form {...form}>
      <FormPreventBack />

      <SafeArea safeTop={false} mode="margin" className="items-stretch">
        <AddressMapView
          onCameraChangeComplete={handleCameraChangeComplete}
          isLoading={isLoading}
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
