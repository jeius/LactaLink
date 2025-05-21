import InfiniteComboBox from '@/components/combobox';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AddressSchema, SetupProfileSchema } from '@lactalink/types';
import { AlertCircleIcon, PlusIcon, StarIcon, Trash2Icon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { HintBox } from './hint-box';

export default function Addresses() {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useFormContext<SetupProfileSchema>();

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

      {fields.map(({ id }, i) => (
        <Card key={id}>
          <VStack space="lg">
            <FormControl isInvalid={!!errors['addresses']?.[i]?.name}>
              <Controller
                control={control}
                name={`addresses.${i}.name`}
                render={({ field }) => (
                  <Input isDisabled={field.disabled} variant="underlined">
                    <InputField
                      value={field.value || ''}
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      placeholder="e.g. Home, Workplace"
                      autoCapitalize="words"
                    />
                  </Input>
                )}
              />
              <FormControlHelper>
                <FormControlHelperText>Name of your address.</FormControlHelperText>
              </FormControlHelper>

              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>{errors.addresses?.[i]?.name?.message}</FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors['addresses']?.[i]?.province}>
              <FormControlLabel>
                <FormControlLabelText>Province</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name={`addresses.${i}.province`}
                render={({ field }) => (
                  <InfiniteComboBox
                    collection={'provinces'}
                    selected={field.value}
                    onSelectionChanged={field.onChange}
                    placeholder="Select province..."
                  />
                )}
              />

              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  {errors.addresses?.[i]?.province?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors['addresses']?.[i]?.cityMunicipality}>
              <FormControlLabel>
                <FormControlLabelText>City or Municipality</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name={`addresses.${i}.cityMunicipality`}
                render={({ field }) => (
                  <InfiniteComboBox
                    collection={'citiesMunicipalities'}
                    selected={field.value}
                    onSelectionChanged={field.onChange}
                    placeholder="Select city or municipality..."
                    where={
                      addresses[i].province
                        ? { province: { equals: addresses[i].province } }
                        : undefined
                    }
                  />
                )}
              />

              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  {errors.addresses?.[i]?.cityMunicipality?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors['addresses']?.[i]?.barangay}>
              <FormControlLabel>
                <FormControlLabelText>Barangay</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name={`addresses.${i}.barangay`}
                render={({ field }) => (
                  <InfiniteComboBox
                    collection={'barangays'}
                    selected={field.value || ''}
                    onSelectionChanged={field.onChange}
                    placeholder="Select barangay..."
                    where={
                      addresses[i].cityMunicipality
                        ? { cityMunicipality: { equals: addresses[i].cityMunicipality } }
                        : undefined
                    }
                  />
                )}
              />

              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  {errors.addresses?.[i]?.barangay?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors['addresses']?.[i]?.street}>
              <FormControlLabel>
                <FormControlLabelText>Street Address</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name={`addresses.${i}.street`}
                render={({ field }) => (
                  <Input isDisabled={field.disabled}>
                    <InputField
                      value={field.value || ''}
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      placeholder="e.g. Block 9, Sudlonon St."
                      autoCapitalize="words"
                      autoComplete="street-address"
                      textContentType="fullStreetAddress"
                    />
                  </Input>
                )}
              />

              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  {errors.addresses?.[i]?.street?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <FormControl isInvalid={!!errors['addresses']?.[i]?.zipCode}>
              <FormControlLabel>
                <FormControlLabelText>Zip Code</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name={`addresses.${i}.zipCode`}
                render={({ field }) => (
                  <Input isDisabled={field.disabled} className="max-w-32">
                    <InputField
                      value={field.value}
                      onBlur={field.onBlur}
                      onChangeText={field.onChange}
                      placeholder="e.g. 9200"
                      keyboardType="number-pad"
                      textContentType="postalCode"
                    />
                  </Input>
                )}
              />

              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  {errors.addresses?.[i]?.zipCode?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <HStack space="xl" className="mt-5 flex-1">
              <Button
                variant={addresses[i].default ? 'solid' : 'outline'}
                action="primary"
                className="grow"
                onPress={() => handleSetDefault(i)}
              >
                {addresses[i].default && <ButtonIcon as={StarIcon} />}
                <ButtonText>{addresses[i].default ? 'Default address' : 'Set default'}</ButtonText>
              </Button>
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
