import { OptionsCardItem } from '@/components/cards/OptionsCards';
import { getIconAsset } from '@/lib/stores';
import { HospitalSchema, IndividualSchema, MilkBankSchema } from '@lactalink/form-schemas';

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
