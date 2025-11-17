import { SetupProfileSchema } from '@lactalink/form-schemas';
import { ImageSource } from 'expo-image';
import { FieldPath } from 'react-hook-form';

export type ProfileTypeOptions = {
  type: SetupProfileSchema['profileType'];
  description: string;
  styleVariant: 'primary' | 'secondary' | 'tertiary';
  image: {
    alt: string;
    source: ImageSource;
  };
};

export type ProfileType = SetupProfileSchema['profileType'];

export type SetupProfileSteps = 'type' | 'details' | 'contact' | 'avatar';

export type SetupProfileFields = Record<SetupProfileSteps, FieldPath<SetupProfileSchema>[]>;
