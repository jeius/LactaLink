import { OptionsSelectField } from '@/components/form-fields/OptionsSelectField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { VStack } from '@/components/ui/vstack';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import { HospitalIcon, User2Icon } from 'lucide-react-native';
import React from 'react';
import { Control } from 'react-hook-form';
import { buildingTypeOptions } from '../lib/options';

export default function HospitalForm({ control }: { control: Control<SetupProfileSchema> }) {
  return (
    <>
      <VStack space="lg" className="px-5">
        <TextInputField
          control={control}
          name="name"
          label="Hospital Name"
          contentPosition="first"
          inputProps={{
            placeholder: 'Enter your hospital name',
            autoCapitalize: 'words',
            textContentType: 'organizationName',
            autoCorrect: true,
            icon: HospitalIcon,
          }}
        />

        <TextAreaField
          control={control}
          name="description"
          label="Description"
          textareaProps={{
            placeholder: 'Enter brief description of the hospital.',
          }}
        />

        <TextInputField
          control={control}
          name="head"
          label="Hospital Head"
          helperText="Enter the name of head/president if applicable."
          contentPosition="first"
          inputProps={{
            placeholder: 'e.g. John M. Doe',
            autoCapitalize: 'words',
            autoComplete: 'name',
            textContentType: 'name',
            icon: User2Icon,
          }}
        />

        <TextInputField
          control={control}
          name="hospitalID"
          contentPosition="first"
          label="Hospital ID"
          inputProps={{
            placeholder: 'Enter your hospital ID',
            autoCapitalize: 'characters',
            autoComplete: 'off',
            textContentType: 'none',
          }}
        />
      </VStack>

      <OptionsSelectField
        control={control}
        name="type"
        label="Is your hospital?"
        items={buildingTypeOptions}
        listProps={{ contentContainerClassName: 'px-5' }}
        labelClassName="px-5"
      />
    </>
  );
}
