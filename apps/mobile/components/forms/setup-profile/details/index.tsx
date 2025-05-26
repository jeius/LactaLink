import { FormField, FormFieldProps } from '@/components/form-field';
import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { ProfileType } from '@/lib/types';
import {
  HospitalSchema,
  IndividualSchema,
  MilkBankSchema,
  SetupProfileSchema,
} from '@lactalink/types';
import { BabyIcon, HashIcon, HospitalIcon, User2Icon } from 'lucide-react-native';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { buildingTypeOptions, genderOptions, maritalStatusOptions } from './options';

export default function ProfileDetails() {
  const profileType = useWatch<SetupProfileSchema>().profileType;

  const FormMap: Record<
    ProfileType,
    FormFieldProps<HospitalSchema | MilkBankSchema | IndividualSchema>[]
  > = {
    HOSPITAL: [
      {
        label: 'Hospital Name',
        name: 'name',
        inputType: 'text',
        inputIcon: HospitalIcon,
        placeholder: 'Enter your hospital name.',
        autoCapitalize: 'words',
        textContentType: 'organizationName',
        autoCorrect: true,
      },
      {
        name: 'description',
        label: 'Description',
        inputType: 'textarea',
        placeholder: 'Enter brief description of the hospital.',
      },
      {
        name: 'head',
        label: 'Hospital Head',
        inputType: 'text',
        inputIcon: User2Icon,
        placeholder: 'e.g. John M. Doe',
        helperText: 'Enter the name of head/president if applicable.',
        autoCapitalize: 'words',
        autoComplete: 'name',
        textContentType: 'name',
      },
      {
        name: 'hospitalID',
        label: 'Hospital ID',
        inputType: 'text',
        inputIcon: HashIcon,
        placeholder: 'e.g. I-1, V-3',
        helperText: 'Enter hospital ID if applicable.',
        className: 'max-w-48',
      },
      {
        name: 'type',
        label: 'Is your hospital?',
        inputType: 'options-cards',
        options: buildingTypeOptions,
      },
    ],
    MILK_BANK: [
      {
        label: 'Milk Bank Name',
        name: 'name',
        inputType: 'text',
        inputIcon: HospitalIcon,
        placeholder: 'Enter your Milk Bank name.',
        autoCapitalize: 'words',
        textContentType: 'organizationName',
        autoCorrect: true,
      },
      {
        name: 'description',
        label: 'Description',
        inputType: 'textarea',
        placeholder: 'Enter brief description of the Milk Bank.',
      },
      {
        name: 'head',
        label: 'Milk Bank Head',
        inputType: 'text',
        inputIcon: User2Icon,
        placeholder: 'e.g. John M. Doe',
        helperText: 'Enter the name of head/president if applicable.',
        autoCapitalize: 'words',
        autoComplete: 'name',
        textContentType: 'name',
      },
      {
        name: 'type',
        label: 'Is your Milk Bank?',
        inputType: 'options-cards',
        options: buildingTypeOptions,
      },
    ],
    INDIVIDUAL: [
      {
        name: 'givenName',
        label: 'Given Name',
        inputType: 'text',
        placeholder: 'Enter your given name.',
        autoCapitalize: 'words',
        autoComplete: 'name-given',
        textContentType: 'givenName',
        autoCorrect: true,
      },
      {
        name: 'middleName',
        label: 'Middle Name',
        inputType: 'text',
        placeholder: 'Enter your middle name.',
        autoCapitalize: 'words',
        autoComplete: 'name-middle',
        textContentType: 'middleName',
        helperText: 'If applicable.',
      },
      {
        name: 'familyName',
        label: 'Family Name',
        inputType: 'text',
        placeholder: 'Enter your family name.',
        autoCapitalize: 'words',
        autoComplete: 'name-family',
        textContentType: 'familyName',
      },
      {
        name: 'dependents',
        label: 'Number of Dependents',
        inputType: 'number',
        placeholder: 'e.g. 2',
        keyboardType: 'number-pad',
        className: 'max-w-48',
        inputIcon: BabyIcon,
      },
      {
        name: 'birth',
        label: 'Date of Birth',
        inputType: 'date',
      },
      {
        name: 'gender',
        label: 'Gender',
        inputType: 'options-cards',
        options: genderOptions,
      },
      {
        name: 'maritalStatus',
        label: 'Marital Status',
        inputType: 'options-cards',
        options: maritalStatusOptions,
      },
    ],
  };

  return (
    profileType && (
      <Card>
        <VStack space="lg">
          {FormMap[profileType].map((props, i) => (
            <FormField key={i} {...props} />
          ))}
        </VStack>
      </Card>
    )
  );
}
