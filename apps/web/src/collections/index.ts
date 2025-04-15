import { CollectionConfig } from 'payload';
import { Accounts } from './Accounts';
import { Admins } from './Admins';
import { Images } from './Images';
import { Media } from './Media';
import { Users } from './Users';

const Collections: CollectionConfig[] = [Users, Accounts, Admins, Images, Media];

export { Accounts, Admins, Images, Media, Users };
export default Collections;
