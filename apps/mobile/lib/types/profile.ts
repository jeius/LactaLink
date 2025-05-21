import {
  Hospital,
  HospitalSchema,
  Individual,
  IndividualSchema,
  MilkBank,
  MilkBankSchema,
  SetupProfileSchema,
} from '@lactalink/types';
import { FieldPath } from 'react-hook-form';

export type ProfileMapData = {
  INDIVIDUAL: { output: Individual; input: IndividualSchema; collection: 'individuals' };
  HOSPITAL: { output: Hospital; input: HospitalSchema; collection: 'hospitals' };
  MILK_BANK: { output: MilkBank; input: MilkBankSchema; collection: 'milkBanks' };
};

export type ProfileType = SetupProfileSchema['profileType'];

export type SetupProfileSteps = 'type' | 'details' | 'contact' | 'avatar';

export type SetupProfileFields = Record<SetupProfileSteps, FieldPath<SetupProfileSchema>[]>;
