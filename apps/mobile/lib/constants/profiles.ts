import {
  HospitalSchema,
  IndividualSchema,
  MilkBankSchema,
  SetupProfileSchema,
} from '@lactalink/types';

export const SETUP_PROFILE_STEPS = [
  '/setup-profile/type',
  '/setup-profile/details',
  '/setup-profile/contact',
  '/setup-profile/avatar',
];

export const INDIVIDUALFIELDS: (keyof IndividualSchema)[] = [
  'givenName',
  'middleName',
  'familyName',
  'dependents',
  'birth',
  'gender',
  'maritalStatus',
];

export const HOSPITALFIELDS: (keyof HospitalSchema)[] = [
  'name',
  'description',
  'head',
  'hospitalID',
  'type',
];

export const MILKBANKFIELDS: (keyof MilkBankSchema)[] = ['name', 'description', 'head', 'type'];

export const CONTACTFIELDS: (keyof SetupProfileSchema)[] = ['addresses', 'phone'];
