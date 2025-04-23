import { CollectionConfig } from 'payload';
import { Addresses } from './Addresses';
import { Avatars } from './Avatars';
import { Barangays } from './Barangays';
import { CitiesMunicipalities } from './CitiesMunicipalities';
import { Images } from './Images';
import { IslandGroups } from './IslandGroups';
import { Provinces } from './Provinces';
import { Regions } from './Regions';
import { Users } from './Users';

const Collections: CollectionConfig[] = [
  Addresses,
  Avatars,
  Barangays,
  CitiesMunicipalities,
  Images,
  IslandGroups,
  Provinces,
  Regions,
  Users,
];

export {
  Addresses,
  Avatars,
  Barangays,
  CitiesMunicipalities,
  Images,
  IslandGroups,
  Provinces,
  Regions,
  Users,
};
export default Collections;
