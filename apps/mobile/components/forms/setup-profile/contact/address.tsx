import { FormField } from '@/components/form-field';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AddressSchema, SetupProfileSchema } from '@lactalink/types';
import { Motion } from '@legendapp/motion';
import { CheckIcon, PlusIcon, Trash2Icon } from 'lucide-react-native';
import React, { createRef, useEffect, useRef } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { HintBox } from './hint-box';

import { DraggableWrapper, DraggableWrapperRef } from '@/components/draggable-wrapper';
import { MMKV_KEYS } from '@/lib/constants';
import { setupProfileStorage } from '@/lib/localStorage';

const storageKey = MMKV_KEYS.SETUP_PROFILE.ADDRESS_COUNT;

export default function Addresses() {
  const draggableRefs = useRef<DraggableWrapperRef[]>([]);
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

  useEffect(() => {
    draggableRefs.current = fields.map(
      (_, i) => draggableRefs.current[i] ?? createRef<DraggableWrapperRef>().current!
    );
  }, [fields]);

  function incrementCount() {
    setupProfileStorage.set(storageKey, createdAddressCount + 1);
  }

  function handleAdd() {
    incrementCount();
    append(defaultValue);
  }

  function handleRemove(index: number) {
    remove(index);
  }

  function handleSetDefault(index: number) {
    const currentDefault = getValues(`addresses.${index}.default`);
    if (currentDefault) return;

    addresses.forEach((_, i) => {
      setValue(`addresses.${i}.default`, i === index);
    });
  }

  return (
    <VStack space="md">
      <Text size="lg" className="font-JakartaMedium">
        Addresses
      </Text>

      <HintBox />

      {fields?.map((field, i) => {
        return (
          <DraggableWrapper
            disabled
            key={field.id}
            ref={(ref) => {
              draggableRefs.current[i] = ref!;
            }}
            onDismiss={() => handleRemove(i)}
          >
            <Motion.View
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                default: { type: 'tween', duration: 200 },
                y: {
                  type: 'spring',
                  damping: 20,
                  stiffness: 300,
                },
              }}
            >
              <Card>
                <VStack space="lg">
                  <FormField
                    name={`addresses.${i}.name`}
                    inputType="text"
                    textInputVariant="underlined"
                    placeholder="e.g. Home, Workplace"
                    autoCapitalize="words"
                    helperText="Name of your address."
                  />

                  <FormField
                    name={`addresses.${i}.province`}
                    label="Province"
                    inputType="combobox"
                    placeholder="Select province..."
                    comboboxProps={{
                      collection: 'provinces',
                      searchPath: 'name',
                      searchPlaceholder: 'Search province here...',
                    }}
                  />

                  <FormField
                    name={`addresses.${i}.cityMunicipality`}
                    label="City or Municipality"
                    inputType="combobox"
                    placeholder="Select city or municipality..."
                    comboboxProps={{
                      collection: 'citiesMunicipalities',
                      searchPath: 'name',
                      searchPlaceholder: 'Search city or municipality here...',
                      where: addresses[i].province
                        ? { province: { equals: addresses[i].province } }
                        : undefined,
                    }}
                  />

                  <FormField
                    name={`addresses.${i}.barangay`}
                    label="Barangay"
                    inputType="combobox"
                    placeholder="Select barangay..."
                    comboboxProps={{
                      collection: 'barangays',
                      searchPath: 'name',
                      searchPlaceholder: 'Search barangay here...',
                      where: addresses[i].cityMunicipality
                        ? { cityMunicipality: { equals: addresses[i].cityMunicipality } }
                        : addresses[i].province
                          ? { province: { equals: addresses[i].province } }
                          : undefined,
                    }}
                  />

                  <FormField
                    name={`addresses.${i}.street`}
                    label="Street Address"
                    inputType="text"
                    placeholder="e.g. Block 9, Sudlonon St."
                    autoCapitalize="words"
                    autoComplete="street-address"
                    textContentType="fullStreetAddress"
                  />

                  <FormField
                    name={`addresses.${i}.zipCode`}
                    label="Zip Code"
                    inputType="text"
                    placeholder="e.g. 9200"
                    keyboardType="number-pad"
                    textContentType="postalCode"
                    className="max-w-32"
                  />

                  <HStack space="xl" className="mt-5 flex-1 justify-between">
                    <Checkbox
                      value={`address-${addresses[i].name}-checkbox`}
                      isChecked={addresses[i].default}
                      onChange={() => {
                        handleSetDefault(i);
                      }}
                    >
                      <CheckboxIndicator>
                        <CheckboxIcon as={CheckIcon} />
                      </CheckboxIndicator>
                      <CheckboxLabel>Set as default address</CheckboxLabel>
                    </Checkbox>
                    <Button
                      isDisabled={addresses.length < 2}
                      variant="link"
                      action="negative"
                      className="px-2"
                      onPress={() => {
                        draggableRefs.current[i]?.dismiss();
                      }}
                    >
                      <ButtonIcon size="md" as={Trash2Icon} />
                    </Button>
                  </HStack>
                </VStack>
              </Card>
            </Motion.View>
          </DraggableWrapper>
        );
      })}

      <Button variant="link" action="primary" className="px-2" onPress={handleAdd}>
        <ButtonIcon size="md" as={PlusIcon} />
        <ButtonText className="text-primary-500">Add Address</ButtonText>
      </Button>
    </VStack>
  );
}
