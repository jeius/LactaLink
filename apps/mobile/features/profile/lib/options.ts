import { OptionsCardItem } from '@/components/cards/OptionsCards';
import { getIconAsset, getImageAsset } from '@/lib/stores';
import { ProfileTypeOptions } from '../lib/types';

import { HospitalSchema, IndividualSchema, MilkBankSchema } from '@lactalink/form-schemas';

export const profileTypeOptions: ProfileTypeOptions[] = [
  {
    type: 'INDIVIDUAL',
    styleVariant: 'primary',
    description: 'Donate or request breastmilk with ease.',
    image: { alt: 'Mother Feeding', source: getImageAsset('individual_0.75x') },
  },
  {
    type: 'HOSPITAL',
    styleVariant: 'tertiary',
    description: 'Screen and manage breastmilk donations.',
    image: { alt: 'Hospital', source: getImageAsset('hospital_0.75x') },
  },
  {
    type: 'MILK_BANK',
    styleVariant: 'secondary',
    description: 'Receive and distribute breastmilk to those in need.',
    image: { alt: 'Milk Packages', source: getImageAsset('milkBank_0.75x') },
  },
];

export const genderOptions: OptionsCardItem<IndividualSchema['gender']>[] = [
  {
    value: 'FEMALE',
    label: 'Female',
    image: { alt: 'Female', source: getIconAsset('female') },
  },
  {
    value: 'MALE',
    label: 'Male',
    image: { alt: 'Male', source: getIconAsset('male') },
  },
  {
    value: 'OTHER',
    label: 'Other',
    image: { alt: 'Other Gender', source: getIconAsset('genderOther') },
  },
];

export const maritalStatusOptions: OptionsCardItem<IndividualSchema['maritalStatus']>[] = [
  {
    value: 'MARRIED',
    label: 'Married',
    image: { alt: 'Married', source: getIconAsset('couple') },
  },
  {
    value: 'SINGLE',
    label: 'Single',
    image: { alt: 'Single', source: getIconAsset('single') },
  },
  {
    value: 'WIDOWED',
    label: 'Widowed',
    image: { alt: 'Widowed', source: getIconAsset('widowed') },
  },
  {
    value: 'DIVORCED',
    label: 'Divorced',
    image: { alt: 'Divorced', source: getIconAsset('divorced') },
  },
  {
    value: 'SEPARATED',
    label: 'Separated',
    image: { alt: 'Separated', source: getIconAsset('separated') },
  },
  {
    value: 'N/A',
    label: 'Prefer not to say',
  },
];

export const buildingTypeOptions: OptionsCardItem<
  HospitalSchema['type'] | MilkBankSchema['type']
>[] = [
  {
    label: 'Government',
    value: 'GOVERNMENT',
    image: { source: getIconAsset('townHall'), alt: 'Government' },
  },
  { label: 'Private', value: 'PRIVATE', image: { source: getIconAsset('office'), alt: 'Office' } },
  {
    label: 'Other',
    value: 'OTHER',
    image: { source: getIconAsset('unknownBuilding'), alt: 'Unknown Building' },
  },
];
