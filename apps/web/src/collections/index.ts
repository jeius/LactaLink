import { CollectionConfig } from 'payload';
import { Addresses } from './Addresses';
import { Avatars } from './Avatars';
import { DeliveryPreferences } from './DeliveryPreferences';
import { Donations } from './Donations';
import { Hospitals } from './Hospitals';
import { Identities } from './Identities';
import { IdentityImages } from './IdentityImages';
import { Images } from './Images';
import { Individuals } from './Individuals';
import { Inventory } from './Inventory';
import { MilkBagImages } from './MilkBagImages';
import { MilkBags } from './MilkBags';
import { MilkBanks } from './MilkBanks';
import { Notifications } from './Notifications';
import { NotificationCategories } from './Notifications/categories';
import { NotificationChannels } from './Notifications/channels';
import { NotificationTypes } from './Notifications/types';
import { Barangays, CitiesMunicipalities, IslandGroups, Regions } from './PSGC';
import { Provinces } from './PSGC/Provinces';
import { Requests } from './Requests';
import { Transactions } from './Transactions';
import { Users } from './Users';

const Collections: CollectionConfig[] = [
  Addresses,
  Avatars,
  Barangays,
  CitiesMunicipalities,
  DeliveryPreferences,
  Donations,
  Hospitals,
  Identities,
  IdentityImages,
  Images,
  Individuals,
  Inventory,
  IslandGroups,
  MilkBags,
  MilkBagImages,
  MilkBanks,
  NotificationCategories,
  NotificationChannels,
  Notifications,
  NotificationTypes,
  Provinces,
  Regions,
  Requests,
  Users,
  Transactions,
];

export {
  Addresses,
  Avatars,
  Barangays,
  CitiesMunicipalities,
  DeliveryPreferences,
  Donations,
  Hospitals,
  Identities,
  IdentityImages,
  Images,
  Individuals,
  Inventory,
  IslandGroups,
  MilkBagImages,
  MilkBags,
  MilkBanks,
  NotificationCategories,
  NotificationChannels,
  Notifications,
  NotificationTypes,
  Provinces,
  Regions,
  Requests,
  Transactions,
  Users,
};

export default Collections;
