import { DateInputField } from '@/components/form-fields/DateInputField';
import { NumberInputField } from '@/components/form-fields/NumberInputField';
import { OptionsSelectField } from '@/components/form-fields/OptionsSelectField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { VStack } from '@/components/ui/vstack';
import { EditProfileSchema } from '@lactalink/form-schemas';
import { BabyIcon, CalendarDaysIcon, PhoneIcon } from 'lucide-react-native';
import React from 'react';
import { Control } from 'react-hook-form';
import { genderOptions, maritalStatusOptions } from '../../lib/options';

export function PersonalEditForm({ control }: { control: Control<EditProfileSchema> }) {
  return (
    <>
      <VStack space="lg" className="px-5">
        <TextInputField
          control={control}
          name="givenName"
          label="Given Name"
          contentPosition="first"
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
          contentPosition="first"
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
          contentPosition="first"
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
          contentPosition="first"
          inputProps={{
            keyboardType: 'number-pad',
            placeholder: 'e.g. 2',
            containerClassName: 'w-64',
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
          contentPosition="first"
          datePickerProps={{
            options: { maximumDate: new Date(), minimumDate: new Date('1900-01-01') },
            icon: CalendarDaysIcon,
          }}
        />

        <TextInputField
          control={control}
          name="phone"
          label="Phone Number"
          inputProps={{
            placeholder: 'e.g. 09123456789',
            keyboardType: 'phone-pad',
            textContentType: 'telephoneNumber',
            autoComplete: 'tel-device',
            autoCapitalize: 'none',
            icon: PhoneIcon,
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
