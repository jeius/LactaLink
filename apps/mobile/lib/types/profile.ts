import { SetupProfileSchema } from '@lactalink/form-schemas';
import { FieldPath } from 'react-hook-form';

export type ProfileType = SetupProfileSchema['profileType'];

export type SetupProfileSteps = 'type' | 'details' | 'contact' | 'avatar';

export type SetupProfileFields = Record<SetupProfileSteps, FieldPath<SetupProfileSchema>[]>;
