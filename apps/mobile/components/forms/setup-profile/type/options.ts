import { getImageAsset } from '@/lib/stores';
import { SetupProfileSchema } from '@lactalink/form-schemas';
import { ImageSource } from 'expo-image';

export type ProfileTypeOptions = {
  type: SetupProfileSchema['profileType'];
  description: string;
  styleVariant: 'primary' | 'secondary' | 'tertiary';
  image: {
    alt: string;
    source: ImageSource;
  };
};

export const options: ProfileTypeOptions[] = [
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
