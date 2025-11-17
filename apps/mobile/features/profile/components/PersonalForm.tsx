import { DateInputField } from '@/components/form-fields/DateInputField';
import { NumberInputField } from '@/components/form-fields/NumberInputField';
import { OptionsSelectField } from '@/components/form-fields/OptionsSelectField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { VStack } from '@/components/ui/vstack';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import { BabyIcon } from 'lucide-react-native';
import React from 'react';
import { Control } from 'react-hook-form';
import { genderOptions, maritalStatusOptions } from '../lib/options';

export default function PersonalForm({ control }: { control: Control<SetupProfileSchema> }) {
  return (
    <>
      <VStack space="lg" className="px-5">
        <TextInputField
          control={control}
          name="givenName"
          label="Given Name"
          inputProps={{
            placeholder: 'Enter your given name',
            autoCapitalize: 'words',
            autoComplete: 'name-given',
            textContentType: 'givenName',
            autoCorrect: true,
          }}
        />

        <TextInputField
          control={control}
          name="middleName"
          label="Middle Name"
          helperText="If applicable"
          inputProps={{
            placeholder: 'Enter your middle name',
            autoCapitalize: 'words',
            autoComplete: 'name-middle',
            textContentType: 'middleName',
          }}
        />

        <TextInputField
          control={control}
          name="familyName"
          label="Family Name"
          inputProps={{
            placeholder: 'Enter your family name',
            autoCapitalize: 'words',
            autoComplete: 'name-family',
            textContentType: 'familyName',
          }}
        />

        <NumberInputField
          control={control}
          name="dependents"
          label="Number of Dependent Babies"
          inputProps={{
            keyboardType: 'number-pad',
            placeholder: 'e.g. 2',
            containerClassName: 'max-w-64',
            showStepButtons: true,
            step: 1,
            min: 0,
            icon: BabyIcon,
          }}
        />

        <DateInputField
          control={control}
          name="birth"
          label="Date of Birth"
          datePickerProps={{
            options: { maximumDate: new Date(), minimumDate: new Date('1900-01-01') },
          }}
        />
      </VStack>

      <VStack space="lg">
        <OptionsSelectField
          control={control}
          name="gender"
          label="Gender"
          items={genderOptions}
          labelClassName="px-5"
          listProps={{ contentContainerClassName: 'px-5' }}
        />

        <OptionsSelectField
          control={control}
          name="maritalStatus"
          label="Marital Status"
          items={maritalStatusOptions}
          labelClassName="px-5"
          listProps={{ contentContainerClassName: 'px-5' }}
        />
      </VStack>
    </>
  );
}
