import { ASSET_IMAGES } from '@/lib/constants/images';
import { SetupProfileSchema } from '@lactalink/types';

type ProfileTypeOptions = {
  type: SetupProfileSchema['profileType'];
  description: string;
  styleVariant: 'primary' | 'secondary' | 'tertiary';
  image: {
    alt: string;
    uri: string;
  };
};

export const options: ProfileTypeOptions[] = [
  {
    type: 'INDIVIDUAL',
    styleVariant: 'primary',
    description: 'Donate or request breastmilk with ease.',
    image: { alt: 'Mother Feeding', uri: ASSET_IMAGES.individual },
  },
  {
    type: 'HOSPITAL',
    styleVariant: 'tertiary',
    description: 'Screen and manage breastmilk donations.',
    image: { alt: 'Hospital', uri: ASSET_IMAGES.hospital },
  },
  {
    type: 'MILK_BANK',
    styleVariant: 'secondary',
    description: 'Receive and distribute breastmilk to those in need.',
    image: { alt: 'Milk Packages', uri: ASSET_IMAGES.milkBank },
  },
];
