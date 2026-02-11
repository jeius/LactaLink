import React from 'react';

import { AddressMapBottomSheet } from '@/components/bottom-sheets/AddressMapBottomSheet';
import { Form } from '@/components/contexts/FormProvider';
import FormPreventBack from '@/components/forms/FormPreventBack';
import GooglePlacesTextInput from '@/components/GooglePlacesTextInput';
import { AddressMapView } from '@/components/map/AddressMapView';
import SafeArea from '@/components/SafeArea';
import { useUpdateAddressMutation } from '@/features/address/hooks/mutations';
import { useAddressForm } from '@/features/address/hooks/useAddressForm';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { AddressSchema } from '@lactalink/form-schemas';
import { ErrorSearchParams } from '@lactalink/types';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractCoordinates, extractErrorMessage } from '@lactalink/utilities/extractors';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useWatch } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { RNCamera, RNRegion } from 'react-native-google-maps-plus';
import { Place } from 'react-native-google-places-textinput';
import { toast } from 'sonner-native';

export default function EditAddressScreen() {
  const router = useRouter();

  const revalidateQueries = useRevalidateCollectionQueries();

  const { id } = useLocalSearchParams<{ id: string }>();

  const form = useAddressForm(id);
  const { isLoading, fetchError: error, setValue, control } = form;

  const { mutateAsync } = useUpdateAddressMutation();

  const coordinates = useWatch({ control, name: 'coordinates' });

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

  function handleCameraChangeComplete(_: RNRegion, camera: RNCamera, isGesture: boolean) {
    if (isGesture && camera?.center) {
      setValue('coordinates', camera.center, { shouldDirty: true, shouldTouch: true });
    }
  }

  function handleSelectPlace({ details }: Place) {
    if (!details) return;

    const { location } = details;
    if (!location) return;

    const coordinates = extractCoordinates(location);
    if (coordinates) {
      setValue('coordinates', coordinates, { shouldDirty: true, shouldTouch: true });
    }
  }

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
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
        >
          <GooglePlacesTextInput onSelect={handleSelectPlace} style={styles.input} />
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

const styles = StyleSheet.create({
  input: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
  },
});
