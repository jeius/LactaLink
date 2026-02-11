import { DeleteActionButton } from '@/components/buttons';
import { LocateButton } from '@/components/buttons/LocateButton';
import { useForm } from '@/components/contexts/FormProvider';
import GooglePlacesTextInput from '@/components/GooglePlacesTextInput';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { AddressMapView } from '@/components/map/AddressMapView';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { VStack } from '@/components/ui/vstack';
import { useDeleteAddressMutation } from '@/features/address/hooks/mutations';
import { createAddressAutofillMutation } from '@/features/address/lib/mutationOptions';
import { AddressCreateSchema } from '@lactalink/form-schemas';
import { GooglePlacesResult } from '@lactalink/types/geocoding';
import { filterUndefined } from '@lactalink/utilities/filters';
import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PinIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';
import { RNCamera, RNRegion } from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChooseLocationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, ...params } = useLocalSearchParams<{ id?: string }>();

  const isEditMode = Boolean(id);

  const { control, reset, getValues, setValue } = useForm<AddressCreateSchema>();

  const coordinates = useWatch({ control: control, name: 'coordinates' });
  const addressName = useWatch({ control: control, name: 'name' });

  const mapCoordinatesRef = useRef(coordinates);

  const { mutate: deleteAddress } = useDeleteAddressMutation();
  const { mutateAsync: getAutoFillValues, isPending } = useMutation(
    createAddressAutofillMutation()
  );

  const handleCameraChangeComplete = useCallback((_: RNRegion, camera: RNCamera) => {
    if (camera?.center) mapCoordinatesRef.current = camera.center;
  }, []);

  const handleDelete = useCallback(() => {
    if (!id) return;
    deleteAddress(id);
    router.back();
  }, [deleteAddress, id, router]);

  const handlePinLocation = useCallback(() => {
    // Update form values with the latest coordinates from the map before navigating
    setValue('coordinates', mapCoordinatesRef.current, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    // Navigate to details screen with current form values
    router.push({ pathname: './details', params }, { relativeToDirectory: true });
  }, [setValue, router, params]);

  const handleSelectPlace = useCallback(
    async (place: GooglePlacesResult) => {
      const newValues = await getAutoFillValues(place);
      // Update the ref with new coordinates from the selected place
      mapCoordinatesRef.current = newValues.coordinates;
      // Update the form values with the new place details
      reset({ ...getValues(), ...filterUndefined(newValues) }, { keepDefaultValues: true });
    },
    [getValues, reset, getAutoFillValues]
  );

  useEffect(() => {
    // Reset map coordinates ref when form coordinates change (e.g., when loading existing address)
    mapCoordinatesRef.current = coordinates;
  }, [coordinates]);

  return (
    <AddressMapView
      mapPadding={{ left: 4, right: 4, top: insets.top + 60, bottom: insets.bottom }}
      onCameraChangeComplete={handleCameraChangeComplete}
      coordinates={coordinates}
      hideHelperText={isEditMode} // Hide helper text in edit mode since user already has an address
    >
      <Box
        className="pointer-events-box-none flex-1 justify-between p-4"
        style={{ marginTop: insets.top, marginBottom: insets.bottom }}
      >
        <VStack>
          <HStack space="sm" className="items-start">
            <HeaderBackButton />
            <GooglePlacesTextInput
              onSelect={handleSelectPlace}
              className="flex-1"
              placeholder="Search a location..."
            />
          </HStack>
          {isPending && <Spinner size={'small'} className="mt-4 self-end" />}
        </VStack>

        <VStack space="xl" className="items-center">
          <VStack space="lg" className="self-end">
            <LocateButton disableFollowUser />
            {isEditMode && (
              <DeleteActionButton
                variant="solid"
                className="p-3"
                itemName={addressName || 'this address'}
                onConfirm={handleDelete}
              />
            )}
          </VStack>

          <Button onPress={handlePinLocation}>
            <ButtonIcon as={PinIcon} />
            <ButtonText>Select this location</ButtonText>
          </Button>
        </VStack>
      </Box>
    </AddressMapView>
  );
}
