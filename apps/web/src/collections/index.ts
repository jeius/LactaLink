import { CollectionConfig } from 'payload';
import { Addresses } from './Addresses';
import { Avatars } from './Avatars';
import { Barangays } from './Barangays';
import { CitiesMunicipalities } from './CitiesMunicipalities';
import { Deliveries } from './Deliveries';
import { Donations } from './Donations';
import { Hospitals } from './Hospitals';
import { Images } from './Images';
import { Individuals } from './Individuals';
import { IslandGroups } from './IslandGroups';
import { MilkBags } from './MilkBags';
import { MilkBanks } from './MilkBanks';
import { Notifications } from './Notifications';
import { NotificationCategories } from './Notifications/categories';
import { NotificationChannels } from './Notifications/channels';
import { NotificationTypes } from './Notifications/types';
import { Provinces } from './Provinces';
import { Regions } from './Regions';
import { Requests } from './Requests';
import { Users } from './Users';

const Collections: CollectionConfig[] = [
  Addresses,
  Avatars,
  Barangays,
  CitiesMunicipalities,
  Deliveries,
  Donations,
  Hospitals,
  Images,
  Individuals,
  IslandGroups,
  MilkBags,
  MilkBanks,
  NotificationCategories,
  NotificationChannels,
  Notifications,
  NotificationTypes,
  Provinces,
  Regions,
  Requests,
  Users,
];

export {
  Addresses,
  Avatars,
  Barangays,
  CitiesMunicipalities,
  Deliveries,
  Donations,
  Hospitals,
  Images,
  Individuals,
  IslandGroups,
  MilkBags,
  MilkBanks,
  NotificationCategories,
  NotificationChannels,
  Notifications,
  NotificationTypes,
  Provinces,
  Regions,
  Requests,
  Users,
};
export default Collections;
