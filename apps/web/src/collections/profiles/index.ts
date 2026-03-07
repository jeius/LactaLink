import { CollectionConfig } from 'payload';
import { Hospitals } from './Hospitals';
import { Individuals } from './Individuals';
import { MilkBanks } from './Milkbanks';

export { Hospitals, Individuals, MilkBanks };

export const ProfileCollections: CollectionConfig[] = [Hospitals, Individuals, MilkBanks];
