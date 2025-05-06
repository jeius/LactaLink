import { CollectionConfig } from 'payload';
import { Addresses } from './Addresses';
import { Avatars } from './Avatars';
import { Barangays } from './Barangays';
import { CitiesMunicipalities } from './CitiesMunicipalities';
import { Hospitals } from './Hospitals';
import { Images } from './Images';
import { Individuals } from './Individuals';
import { IslandGroups } from './IslandGroups';
import { MilkBanks } from './MilkBanks';
import { Provinces } from './Provinces';
import { Regions } from './Regions';
import { Users } from './Users';

const Collections: CollectionConfig[] = [
  Addresses,
  Avatars,
  Barangays,
  CitiesMunicipalities,
  Hospitals,
  Images,
  Individuals,
  IslandGroups,
  MilkBanks,
  Provinces,
  Regions,
  Users,
];

export {
  Addresses,
  Avatars,
  Barangays,
  CitiesMunicipalities,
  Hospitals,
  Images,
  Individuals,
  IslandGroups,
  MilkBanks,
  Provinces,
  Regions,
  Users,
};
export default Collections;
