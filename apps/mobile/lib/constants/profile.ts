import {
  HospitalSchema,
  IndividualSchema,
  MilkBankSchema,
  SetupProfileSchema,
} from '@lactalink/types';
import { Building2Icon, BuildingIcon, LucideProps, UserIcon } from 'lucide-react-native';
import { SvgProps } from 'react-native-svg';
import { ProfileType, SetupProfileSteps } from '../types';

export const SETUP_PROFILE_STEPS: SetupProfileSteps[] = ['type', 'details', 'contact', 'avatar'];

export const TYPE_FIELDS: (keyof SetupProfileSchema)[] = ['profileType'];
export const INDIVIDUAL_FIELDS: (keyof IndividualSchema)[] = [
  'givenName',
  'middleName',
  'familyName',
  'dependents',
  'birth',
  'gender',
  'maritalStatus',
];
export const HOSPITAL_FIELDS: (keyof HospitalSchema)[] = [
  'name',
  'description',
  'head',
  'hospitalID',
  'type',
];
export const MILKBANK_FIELDS: (keyof MilkBankSchema)[] = ['name', 'description', 'head', 'type'];
export const DETAILS_FIELDS = {
  INDIVIDUAL: INDIVIDUAL_FIELDS,
  HOSPITAL: HOSPITAL_FIELDS,
  MILK_BANK: MILKBANK_FIELDS,
};
export const CONTACT_FIELDS: (keyof SetupProfileSchema)[] = ['phone'];
export const AVATAR_FIELDS: (keyof SetupProfileSchema)[] = ['avatar'];

export const PROFILE_TYPE_ICONS: Record<ProfileType, React.FC<SvgProps | LucideProps>> = {
  INDIVIDUAL: UserIcon,
  HOSPITAL: Building2Icon,
  MILK_BANK: BuildingIcon,
};
