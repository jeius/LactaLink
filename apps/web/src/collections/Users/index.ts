import { collectionGroup } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import { endpoints } from './endpoints';

export const Users: CollectionConfig<'users'> = {
  slug: 'users',
  admin: {
    group: collectionGroup.user,
    useAsTitle: 'email',
  },
  auth: true,
  endpoints,
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      saveToJWT: true,
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'individual',
      required: true,
      options: [
        {
          label: 'Individual',
          value: 'individual',
        },
        {
          label: 'Hospital',
          value: 'hospital',
        },
        {
          label: 'Milk Bank',
          value: 'milkBank',
        },
      ],
    },
  ],
};
