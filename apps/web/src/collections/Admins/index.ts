import { collectionGroup } from '@/lib/constants';
import { CollectionConfig } from 'payload';

export const Admins: CollectionConfig<'admins'> = {
  slug: 'admins',
  admin: {
    group: collectionGroup.user,
    useAsTitle: 'email',
    defaultColumns: ['email', 'id'],
  },
  auth: true,
  fields: [],
};
