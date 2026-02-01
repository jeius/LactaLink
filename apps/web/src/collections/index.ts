import { CollectionConfig } from 'payload';
import { Addresses } from './Addresses';
import BlockedUsers from './BlockedUsers';
import { ChatSystemCollections } from './chat-system';
import { Comments } from './Comments';
import { DeliveryPreferences } from './DeliveryPreferences';
import { DonationReads } from './DonationReads';
import { Donations } from './Donations';
import { DonorScreenings } from './DonorScreenings';
import { Hospitals } from './Hospitals';
import { Identities } from './Identities';
import { Individuals } from './Individuals';
import { Inventory } from './Inventory';
import { Likes } from './Likes';
import MediaCollections from './media';
import { MilkBags } from './MilkBags';
import { MilkBanks } from './MilkBanks';
import { Notifications } from './Notifications';
import { NotificationCategories } from './Notifications/categories';
import { NotificationChannels } from './Notifications/channels';
import { NotificationTypes } from './Notifications/types';
import { Posts } from './Posts';
import { Barangays, CitiesMunicipalities, IslandGroups, Regions } from './PSGC';
import { Provinces } from './PSGC/Provinces';
import { RequestReads } from './RequestReads';
import { Requests } from './Requests';
import TransactionCollections from './transaction-system';
import { Users } from './Users';

const Collections: CollectionConfig[] = [
  Addresses,
  BlockedUsers,
  Barangays,
  CitiesMunicipalities,
  Comments,
  DeliveryPreferences,
  DonationReads,
  DonorScreenings,
  Donations,
  Hospitals,
  Identities,
  Individuals,
  Inventory,
  IslandGroups,
  Likes,
  MilkBags,
  MilkBanks,
  NotificationCategories,
  NotificationChannels,
  Notifications,
  NotificationTypes,
  Posts,
  Provinces,
  Regions,
  RequestReads,
  Requests,
  Users,
  ...TransactionCollections,
  ...ChatSystemCollections,
  ...MediaCollections,
];

export { Hospitals, Individuals, MilkBanks, Users };

export default Collections;
