import { OptionsSelectField } from '@/components/form-fields/OptionsSelectField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { VStack } from '@/components/ui/vstack';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import { Building2Icon, User2Icon } from 'lucide-react-native';
import React from 'react';
import { Control } from 'react-hook-form';
import { buildingTypeOptions } from '../lib/options';

export default function MilkBankForm({ control }: { control: Control<SetupProfileSchema> }) {
  return (
    <>
      <VStack space="lg" className="px-5">
        <TextInputField
          control={control}
          name="name"
          label="Milk Bank Name"
          inputProps={{
            placeholder: 'Enter your hospital name',
            autoCapitalize: 'words',
            textContentType: 'organizationName',
            autoCorrect: true,
            icon: Building2Icon,
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
          label="Milk Bank Head"
          helperText="Enter the name of head/president if applicable."
          inputProps={{
            placeholder: 'e.g. John M. Doe',
            autoCapitalize: 'words',
            autoComplete: 'name',
            textContentType: 'name',
            icon: User2Icon,
          }}
        />
      </VStack>

      <OptionsSelectField
        control={control}
        name="type"
        label="Is your milk bank?"
        items={buildingTypeOptions}
        listProps={{ contentContainerClassName: 'px-5' }}
        labelClassName="px-5"
      />
    </>
  );
}
