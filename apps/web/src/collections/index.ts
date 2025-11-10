import { CollectionConfig } from 'payload';
import { Addresses } from './Addresses';
import { Avatars } from './Avatars';
import { Comments } from './Comments';
import { DeliveryPreferences } from './DeliveryPreferences';
import { Donations } from './Donations';
import { Hospitals } from './Hospitals';
import { Identities } from './Identities';
import { Individuals } from './Individuals';
import { Inventory } from './Inventory';
import { IdentityImages } from './media/IdentityImages';
import { Images } from './media/Images';
import { MilkBagImages } from './media/MilkBagImages';
import { MilkBags } from './MilkBags';
import { MilkBanks } from './MilkBanks';
import { Notifications } from './Notifications';
import { NotificationCategories } from './Notifications/categories';
import { NotificationChannels } from './Notifications/channels';
import { NotificationTypes } from './Notifications/types';
import { Posts } from './Posts';
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
  Comments,
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
  Posts,
  Provinces,
  Regions,
  Requests,
  Users,
  Transactions,
];

export { Hospitals, Individuals, MilkBanks, Users };

export default Collections;
