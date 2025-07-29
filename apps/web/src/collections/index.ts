import { CollectionConfig } from 'payload';
import { Addresses } from './Addresses';
import { Avatars } from './Avatars';
import { Deliveries } from './Deliveries';
import { DeliveryPreferences } from './DeliveryPreferences';
import { Donations } from './Donations';
import { Hospitals } from './Hospitals';
import { Images } from './Images';
import { Individuals } from './Individuals';
import { Inventory } from './Inventory';
import { Matches } from './Matches';
import { MilkBags } from './MilkBags';
import { MilkBanks } from './MilkBanks';
import { Notifications } from './Notifications';
import { NotificationCategories } from './Notifications/categories';
import { NotificationChannels } from './Notifications/channels';
import { NotificationTypes } from './Notifications/types';
import { Barangays, CitiesMunicipalities, IslandGroups, Regions } from './PSGC';
import { Provinces } from './PSGC/Provinces';
import { Requests } from './Requests';
import { Users } from './Users';

const Collections: CollectionConfig[] = [
  Addresses,
  Avatars,
  Barangays,
  CitiesMunicipalities,
  Deliveries,
  DeliveryPreferences,
  Donations,
  Hospitals,
  Images,
  Individuals,
  Inventory,
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
  Matches,
  Users,
];

export {
  Addresses,
  Avatars,
  Barangays,
  CitiesMunicipalities,
  Deliveries,
  DeliveryPreferences,
  Donations,
  Hospitals,
  Images,
  Individuals,
  Inventory,
  IslandGroups,
  Matches,
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
