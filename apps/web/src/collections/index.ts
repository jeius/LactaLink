import { CollectionConfig } from 'payload';
import { Accounts } from './Accounts';
import { Images } from './Images';
import { Media } from './Media';
import { Users } from './Users';

const Collections: CollectionConfig[] = [Users, Accounts, Images, Media];

export default Collections;
