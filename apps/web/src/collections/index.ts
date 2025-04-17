import { CollectionConfig } from 'payload';
import { Accounts } from './Accounts';
import { Addresses } from './Addresses';
import { Admins } from './Admins';
import { Avatars } from './Avatars';
import { Barangays } from './Barangays';
import { CitiesMunicipalities } from './CitiesMunicipalities';
import { Images } from './Images';
import { IslandGroups } from './IslandGroups';
import { Provinces } from './Provinces';
import { Regions } from './Regions';
import { Users } from './Users';

const Collections: CollectionConfig[] = [
  Accounts,
  Addresses,
  Admins,
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
  Accounts,
  Addresses,
  Admins,
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
