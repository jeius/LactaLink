import { TextInputField } from '@/components/form-fields/TextInputField';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { AddressCreateSchema } from '@lactalink/form-schemas';
import { CheckIcon } from 'lucide-react-native';
import React from 'react';
import { Control, Controller, useFormState, useWatch } from 'react-hook-form';
import { BarangaySelectField, CitySelectField, ProvinceSelectField } from './form-fields';

interface Props {
  control: Control<AddressCreateSchema>;
  isLoading?: boolean;
}

export default function AddressForm({ control, isLoading }: Props) {
  const { isSubmitting } = useFormState({ control });

  const cityID = useWatch({ control, name: 'cityMunicipality' });
  const provinceID = useWatch({ control, name: 'province' });

  return (
    <VStack space="lg" className="p-4 pt-0">
      <ProvinceSelectField
        control={control}
        name={`province`}
        label="Province"
        placeholder="Select a province..."
        isLoading={isLoading}
        isDisabled={isSubmitting}
      />

      <CitySelectField
        control={control}
        name={`cityMunicipality`}
        label="City or Municipality"
        placeholder="Select a city or municipality..."
        provinceID={provinceID}
        isLoading={isLoading}
        isDisabled={isSubmitting}
      />

      <BarangaySelectField
        control={control}
        name={`barangay`}
        label="Barangay"
        helperText="If applicable, select the barangay of this address."
        placeholder="Select a barangay..."
        cityID={cityID}
        isLoading={isLoading}
        isDisabled={isSubmitting}
      />

      <TextInputField
        control={control}
        name="street"
        label="Street Address"
        helperText="Enter the street address of this location."
        contentPosition="first"
        isLoading={isLoading}
        isDisabled={isSubmitting}
        inputProps={{
          autoCapitalize: 'words',
          placeholder: 'e.g. Block 9, Sudlonon St.',
          autoComplete: 'street-address',
          textContentType: 'fullStreetAddress',
        }}
      />

      <TextInputField
        control={control}
        name="zipCode"
        label="Zip Code"
        helperText="Enter the zip/postal code of this address."
        contentPosition="first"
        isLoading={isLoading}
        isDisabled={isSubmitting}
        inputProps={{
          placeholder: 'e.g. 9200',
          containerClassName: 'max-w-32',
          keyboardType: 'number-pad',
          textContentType: 'postalCode',
        }}
      />

      <TextInputField
        control={control}
        name="name"
        label="Address Label"
        helperText="Set a label for this address to easily identify it."
        contentPosition="first"
        isLoading={isLoading}
        isDisabled={isSubmitting}
        inputProps={{
          autoCapitalize: 'words',
          placeholder: 'e.g. Home, Workplace',
        }}
      />

      <HStack space="xl" className="justify-between">
        <Controller
          control={control}
          name="isDefault"
          render={({ field: { value, onChange, ref } }) => (
            <Checkbox
              ref={ref}
              value={`checkbox-address-isDefault`}
              isChecked={value}
              onChange={onChange}
              isDisabled={isSubmitting}
            >
              <CheckboxIndicator>
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
              <CheckboxLabel>Set as default address</CheckboxLabel>
            </Checkbox>
          )}
        />
      </HStack>
    </VStack>
  );
}
