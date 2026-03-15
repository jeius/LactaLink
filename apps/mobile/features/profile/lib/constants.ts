import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';
import {
  HospitalSchema,
  IndividualSchema,
  MilkBankSchema,
  SetupProfileSchema,
} from '@lactalink/form-schemas';
import { Building2Icon, HospitalIcon, LucideProps, UserIcon } from 'lucide-react-native';
import { SvgProps } from 'react-native-svg';
import { ProfileType, SetupProfileSteps } from '../lib/types';

const STEPS: SetupProfileSteps[] = ['type', 'details', 'contact', 'avatar'];
export const PROFILE_SETUP_ROUTES = createDynamicRoute('/profile/setup', STEPS);

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

export const PROFILE_TYPE_ICONS: Record<ProfileType, React.FC<SvgProps | LucideProps>> = {
  INDIVIDUAL: UserIcon,
  HOSPITAL: HospitalIcon,
  MILK_BANK: Building2Icon,
};

export const TYPE_FIELDS: (keyof SetupProfileSchema)[] = ['profileType'];
