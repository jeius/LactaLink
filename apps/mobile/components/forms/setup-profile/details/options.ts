import { OptionsCardItem } from '@/components/cards/OptionsCards';
import { ICONS } from '@/lib/constants';
import { HospitalSchema, IndividualSchema, MilkBankSchema } from '@lactalink/types';

export const genderOptions: OptionsCardItem<IndividualSchema['gender']>[] = [
  {
    value: 'FEMALE',
    label: 'Female',
    image: { alt: 'Female Gender', uri: ICONS.female },
  },
  {
    value: 'MALE',
    label: 'Male',
    image: { alt: 'Male Gender', uri: ICONS.male },
  },
  {
    value: 'OTHER',
    label: 'Other',
    image: { alt: 'Unknown Gender', uri: ICONS.genderOther },
  },
];

export const maritalStatusOptions: OptionsCardItem<IndividualSchema['maritalStatus']>[] = [
  {
    value: 'MARRIED',
    label: 'Married',
    image: { alt: 'Married icon', uri: ICONS.married },
  },
  {
    value: 'SINGLE',
    label: 'Single',
    image: { alt: 'Single icon', uri: ICONS.single },
  },
  {
    value: 'WIDOWED',
    label: 'Widowed',
    image: { alt: 'Widowed icon', uri: ICONS.widowed },
  },
  {
    value: 'DIVORCED',
    label: 'Divorced',
    image: { alt: 'Divorced icon', uri: ICONS.divorced },
  },
  {
    value: 'SEPARATED',
    label: 'Separated',
    image: { alt: 'Separated icon', uri: ICONS.separated },
  },
  {
    value: 'N/A',
    label: 'Prefer not to say',
  },
];

export const buildingTypeOptions: OptionsCardItem<
  HospitalSchema['type'] | MilkBankSchema['type']
>[] = [
  { label: 'Government', value: 'GOVERNMENT', image: { uri: ICONS.townHall, alt: 'Government' } },
  { label: 'Private', value: 'PRIVATE', image: { uri: ICONS.office, alt: 'Office' } },
  { label: 'Other', value: 'OTHER', image: { uri: ICONS.buildingOther, alt: 'Unknown Building' } },
];
