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
import { createAddressAutofillMutation } from '@/features/address/lib/mutationOptions';
import { AddressCreateSchema } from '@lactalink/form-schemas';
import { GooglePlacesResult } from '@lactalink/types/geocoding';
import { filterUndefined } from '@lactalink/utilities/filters';
import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PinIcon } from 'lucide-react-native';
import React, { useCallback, useRef } from 'react';
import { useWatch } from 'react-hook-form';
import { RNCamera, RNRegion } from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddressCreateScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const router = useRouter();

  const { control, reset, getValues } = useForm<AddressCreateSchema>();

  const coordinates = useWatch({ control: control, name: 'coordinates' });
  const mapCoordinatesRef = useRef(coordinates);

  const { mutateAsync: getAutoFillValues, isPending } = useMutation(
    createAddressAutofillMutation()
  );

  const handleCameraChangeComplete = useCallback((_: RNRegion, camera: RNCamera) => {
    if (camera?.center) mapCoordinatesRef.current = camera.center;
  }, []);

  const handlePinLocation = useCallback(() => {
    // Update form values with the latest coordinates from the map before navigating
    reset({ ...getValues(), coordinates: mapCoordinatesRef.current });
    // Navigate to details screen with current form values
    router.push({ pathname: '/addresses/create/details', params });
  }, [reset, getValues, router, params]);

  const handleSelectPlace = useCallback(
    async (place: GooglePlacesResult) => {
      const newValues = await getAutoFillValues(place);
      // Update the ref with new coordinates from the selected place
      mapCoordinatesRef.current = newValues.coordinates;
      // Update the form values with the new place details, keeping dirty state
      reset({ ...getValues(), ...filterUndefined(newValues) }, { keepDirty: true });
    },
    [getValues, reset, getAutoFillValues]
  );

  return (
    <AddressMapView
      mapPadding={{ left: 4, right: 4, top: insets.top + 60, bottom: insets.bottom }}
      onCameraChangeComplete={handleCameraChangeComplete}
      coordinates={coordinates}
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

        <VStack space="md">
          <LocateButton className="self-end" disableFollowUser />

          <Button className="self-center" onPress={handlePinLocation}>
            <ButtonIcon as={PinIcon} />
            <ButtonText>Use this location</ButtonText>
          </Button>
        </VStack>
      </Box>
    </AddressMapView>
  );
}
