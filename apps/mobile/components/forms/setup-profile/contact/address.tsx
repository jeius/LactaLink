import { FormField } from '@/components/FormField';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AddressSchema, SetupProfileSchema } from '@lactalink/types';
import {
  CheckIcon,
  LandmarkIcon,
  MapPinHouseIcon,
  MountainIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { HintAlert } from '../../../HintAlert';

import { MapTileButton } from '@/components/map/MapTileButton';
import { Box } from '@/components/ui/box';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentLocation } from '@/hooks/location/useLocation';
import { MMKV_KEYS } from '@/lib/constants';
import { setupProfileStorage } from '@/lib/localStorage';
import { Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LatLng } from 'react-native-maps';

const storageKey = MMKV_KEYS.SETUP_PROFILE.ADDRESS_COUNT;
const DEVICE_WIDTH = Dimensions.get('window').width;

export default function Addresses() {
  const scrollRef = useRef<ScrollView>(null);
  const { setValue, getValues, watch, control } = useFormContext<SetupProfileSchema>();
  const { fields, append, remove } = useFieldArray({ control, name: 'addresses' });

  const addresses = watch('addresses');
  const createdAddressCount = setupProfileStorage.getNumber(storageKey) || 0;

  const defaultValue: AddressSchema = {
    name: `Address-${createdAddressCount + 1}`,
    street: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
    zipCode: '',
    default: false,
  };

  useEffect(() => {
    if (!addresses || addresses.length === 0) {
      append({ ...defaultValue, default: true });
      incrementCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function incrementCount() {
    setupProfileStorage.set(storageKey, createdAddressCount + 1);
  }

  function handleAdd() {
    incrementCount();
    append(defaultValue);
    // Scroll to the end of the list after adding a new item
    // Delaying the scroll to ensure the new item is rendered
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }

  const handleRemove = useCallback(
    (index: number) => {
      if (fields.length < 2) return;
      scrollRef.current?.scrollTo({ animated: true, x: DEVICE_WIDTH });
      // Delay the removal to allow the scroll animation to complete
      // This is a workaround to avoid the list jumping back to the first item
      setTimeout(() => {
        remove(index);
      }, 50);
    },
    [fields.length, remove]
  );

  const handleSetDefault = useCallback(
    (index: number) => {
      const currentDefault = getValues(`addresses.${index}.default`);
      if (currentDefault) return;

      addresses.forEach((_, i) => {
        setValue(`addresses.${i}.default`, i === index);
      });
    },
    [addresses, getValues, setValue]
  );

  return (
    <VStack>
      <Text size="lg" className="font-JakartaMedium mx-5">
        Addresses
      </Text>

      <Box className="mx-5 py-2">
        <HintAlert message="You can add more addresses." />
      </Box>

      <VStack>
        <ScrollView ref={scrollRef} horizontal contentContainerStyle={{ paddingRight: 20 }}>
          {fields.map((field, index) => (
            <RenderCard
              key={field.id}
              addresses={addresses}
              index={index}
              onRemove={handleRemove}
              onSetDefault={handleSetDefault}
              disableRemove={addresses.length < 2}
            />
          ))}
        </ScrollView>

        <Button variant="link" action="positive" className="mx-auto" onPress={handleAdd}>
          <ButtonIcon size="md" as={PlusIcon} />
          <ButtonText>Add Address</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}

type RenderCardProps = {
  addresses: AddressSchema[];
  index: number;
  onRemove: (index: number) => void;
  onSetDefault: (index: number) => void;
  disableRemove?: boolean;
};
function RenderCard({
  addresses,
  index: i,
  onRemove,
  onSetDefault,
  disableRemove = false,
}: RenderCardProps) {
  const { setValue } = useFormContext<SetupProfileSchema>();
  const { location, isLoading } = useCurrentLocation();
  const locationCoords = location?.coords && {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  const coordinates: LatLng | undefined = addresses[i]?.coordinates || locationCoords;

  function handleLocationPin(coords: LatLng) {
    setValue(`addresses.${i}.coordinates`, coords);
  }

  return (
    <Card style={{ width: DEVICE_WIDTH - 40, marginBottom: 16, marginLeft: 20 }}>
      <VStack space="lg">
        <FormField
          name={`addresses.${i}.name`}
          fieldType="text"
          variant="underlined"
          placeholder="e.g. Home, Workplace"
          autoCapitalize="words"
          helperText="Name of your address."
        />

        <FormField
          name={`addresses.${i}.province`}
          label="Province"
          fieldType="combobox"
          placeholder="Select province..."
          collection="provinces"
          searchPath="name"
          searchPlaceholder="Search province here..."
          icon={MountainIcon}
          iconPosition="left"
        />

        <FormField
          name={`addresses.${i}.cityMunicipality`}
          label="City or Municipality"
          fieldType="combobox"
          placeholder="Select city or municipality..."
          collection="citiesMunicipalities"
          searchPath="name"
          searchPlaceholder="Search city or municipality here..."
          icon={LandmarkIcon}
          iconPosition="left"
          where={
            addresses[i]?.province ? { province: { equals: addresses[i]?.province } } : undefined
          }
        />

        <FormField
          name={`addresses.${i}.barangay`}
          label="Barangay"
          fieldType="combobox"
          placeholder="Select barangay..."
          collection="barangays"
          searchPath="name"
          searchPlaceholder="Search barangay here..."
          icon={MapPinHouseIcon}
          iconPosition="left"
          where={
            addresses[i]?.cityMunicipality
              ? { cityMunicipality: { equals: addresses[i]?.cityMunicipality } }
              : addresses[i]?.province
                ? { province: { equals: addresses[i]?.province } }
                : undefined
          }
        />

        <FormField
          name={`addresses.${i}.street`}
          label="Street Address"
          fieldType="text"
          placeholder="e.g. Block 9, Sudlonon St."
          autoCapitalize="words"
          autoComplete="street-address"
          textContentType="fullStreetAddress"
        />

        <FormField
          name={`addresses.${i}.zipCode`}
          label="Zip Code"
          fieldType="text"
          placeholder="e.g. 9200"
          keyboardType="number-pad"
          textContentType="postalCode"
          className="max-w-32"
        />

        <HStack space="xl" className="justify-between">
          <Checkbox
            value={`address-${addresses[i]?.name}-checkbox`}
            isChecked={addresses[i]?.default}
            onChange={() => {
              onSetDefault(i);
            }}
          >
            <CheckboxIndicator>
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
            <CheckboxLabel>Set as default address</CheckboxLabel>
          </Checkbox>
          <Button
            isDisabled={disableRemove}
            variant="link"
            action="negative"
            className="px-2"
            onPress={() => onRemove(i)}
          >
            <ButtonIcon size="md" as={Trash2Icon} />
          </Button>
        </HStack>

        <Box className="relative h-28 w-full overflow-hidden rounded-lg shadow">
          {isLoading ? (
            <Skeleton className="h-full w-full" speed={4} />
          ) : (
            <MapTileButton coordinates={coordinates} onLocationPin={handleLocationPin} />
          )}
          {!isLoading && (
            <Box pointerEvents="none" className="absolute inset-0 items-center justify-center">
              <Text className="font-JakartaMedium">Tap to pin the location.</Text>
            </Box>
          )}
        </Box>
      </VStack>
    </Card>
  );
}
