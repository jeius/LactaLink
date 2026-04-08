import { CheckboxField } from '@/components/form-fields/CheckboxField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { VStack } from '@/components/ui/vstack';
import { AddressCreateSchema } from '@lactalink/form-schemas';
import { Control, useFormState, useWatch } from 'react-hook-form';
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
        isRequired
        isDisabled={isSubmitting}
      />

      <CitySelectField
        control={control}
        name={`cityMunicipality`}
        label="City or Municipality"
        placeholder="Select a city or municipality..."
        provinceID={provinceID}
        isLoading={isLoading}
        isRequired
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
        isRequired
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

      <CheckboxField
        control={control}
        name="isDefault"
        label="Set as default address"
        className="mt-2"
      />
    </VStack>
  );
}
