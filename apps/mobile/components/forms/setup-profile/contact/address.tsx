import { ControlledInput } from '@/components/controlled-input';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AddressSchema, SetupProfileSchema } from '@lactalink/types';
import { CheckIcon, PlusIcon, Trash2Icon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { HintBox } from './hint-box';

export default function Addresses() {
  const { control, setValue, getValues, watch } = useFormContext<SetupProfileSchema>();
  const { append, remove, fields } = useFieldArray({ control, name: 'addresses' });
  const addresses = watch('addresses');

  const defaultAddress: AddressSchema = {
    name: `Address-${fields.length + 1}`,
    street: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
    zipCode: '',
    default: false,
  };

  useEffect(() => {
    if (!fields.length) {
      append({ ...defaultAddress, default: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [append, fields]);

  async function handleAdd() {
    append(defaultAddress);
  }

  function handleSetDefault(index: number) {
    const currentDefault = getValues(`addresses.${index}.default`);
    if (currentDefault) return;

    fields.forEach((_, i) => {
      setValue(`addresses.${i}.default`, i === index);
    });
  }

  return (
    <VStack space="md">
      <Text size="lg" className="font-JakartaMedium">
        Addresses
      </Text>

      <HintBox />

      {fields.map((address, i) => (
        <Card key={address.id}>
          <VStack space="lg">
            <ControlledInput
              name={`addresses.${i}.name`}
              inputType="text"
              textInputVariant="underlined"
              placeholder="e.g. Home, Workplace"
              autoCapitalize="words"
              helperText="Name of your address."
            />

            <ControlledInput
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

            <ControlledInput
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

            <ControlledInput
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

            <ControlledInput
              name={`addresses.${i}.street`}
              label="Street Address"
              inputType="text"
              placeholder="e.g. Block 9, Sudlonon St."
              autoCapitalize="words"
              autoComplete="street-address"
              textContentType="fullStreetAddress"
            />

            <ControlledInput
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
                isDisabled={fields.length < 2}
                variant="link"
                action="negative"
                className="px-2"
                onPress={() => remove(i)}
              >
                <ButtonIcon size="md" as={Trash2Icon} />
              </Button>
            </HStack>
          </VStack>
        </Card>
      ))}

      <Button variant="link" action="primary" className="px-2" onPress={handleAdd}>
        <ButtonIcon size="md" as={PlusIcon} />
        <ButtonText className="text-primary-500">Add Address</ButtonText>
      </Button>
    </VStack>
  );
}
