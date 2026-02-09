import { LocateButton } from '@/components/buttons/LocateButton';
import { useForm } from '@/components/contexts/FormProvider';
import GooglePlacesTextInput from '@/components/GooglePlacesTextInput';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { AddressMapView } from '@/components/map/AddressMapView';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { AddressCreateSchema } from '@lactalink/form-schemas';
import { GooglePlacesResult } from '@lactalink/types/geocoding';
import { parseGooglePlacesResult } from '@lactalink/utilities/geocoding';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PinIcon } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { RNCamera, RNRegion } from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddressCreateScreen() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();
  const router = useRouter();

  const { control, reset, getValues, setValue } = useForm<AddressCreateSchema>();

  const coordinates = useWatch({ control: control, name: 'coordinates' });

  function handleCameraChangeComplete(_: RNRegion, camera: RNCamera, isGesture: boolean) {
    if (isGesture && camera?.center) {
      setValue('coordinates', camera.center, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }

  const handleSelectPlace = useCallback(
    (place: GooglePlacesResult) => {
      const { details } = place;
      console.log('Selected place:', place);

      const parsedResult = parseGooglePlacesResult(place);
      console.log('Parsed results:', parsedResult);

      if (!details) return;

      const { location } = details;
      if (!location) return;

      if (parsedResult.coordinates) {
        setValue('coordinates', parsedResult.coordinates, { shouldDirty: true, shouldTouch: true });
      }

      if (parsedResult.zipCode) {
        setValue('zipCode', parsedResult.zipCode, { shouldDirty: true, shouldTouch: true });
      }
    },
    [setValue]
  );

  const handlePinLocation = useCallback(() => {
    reset(getValues());
    router.push({ pathname: '/addresses/create/details', params });
  }, [reset, getValues, router, params]);

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
        <HStack space="sm" className="items-start">
          <HeaderBackButton />
          <GooglePlacesTextInput
            onSelect={handleSelectPlace}
            className="flex-1"
            placeholder="Search a location..."
          />
        </HStack>

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
