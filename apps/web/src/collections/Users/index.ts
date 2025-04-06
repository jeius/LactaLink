import { collectionGroup } from '@/lib/constants';
import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig<'users'> = {
  slug: 'users',
  admin: {
    group: collectionGroup.user,
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
};
