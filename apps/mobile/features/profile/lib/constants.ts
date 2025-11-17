import {
  HospitalSchema,
  IndividualSchema,
  MilkBankSchema,
  SetupProfileSchema,
} from '@lactalink/form-schemas';
import { SetupProfileSteps } from '../types';

export const SETUP_PROFILE_STEPS: SetupProfileSteps[] = ['type', 'details', 'contact', 'avatar'];

export const TYPE_FIELDS: (keyof SetupProfileSchema)[] = ['profileType'];

const INDIVIDUAL_FIELDS: (keyof IndividualSchema)[] = [
  'givenName',
  'middleName',
  'familyName',
  'dependents',
  'birth',
  'gender',
  'maritalStatus',
];

const HOSPITAL_FIELDS: (keyof HospitalSchema)[] = [
  'name',
  'description',
  'head',
  'hospitalID',
  'type',
];

const MILKBANK_FIELDS: (keyof MilkBankSchema)[] = ['name', 'description', 'head', 'type'];

export const DETAILS_FIELDS = {
  INDIVIDUAL: INDIVIDUAL_FIELDS,
  HOSPITAL: HOSPITAL_FIELDS,
  MILK_BANK: MILKBANK_FIELDS,
};
export const CONTACT_FIELDS: (keyof SetupProfileSchema)[] = ['phone'];
export const AVATAR_FIELDS: (keyof SetupProfileSchema)[] = ['avatar'];
