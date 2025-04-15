import { collectionEndpoints } from '@/auth/endpoints';
import { collectionGroup } from '@/lib/constants';
import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig<'users'> = {
  slug: 'users',
  admin: {
    group: collectionGroup.user,
    useAsTitle: 'email',
    defaultColumns: ['email', 'type', 'id'],
  },
  auth: true,
  access: {
    read: ({ req }) => Boolean(req.user),
  },
  endpoints: collectionEndpoints,
  fields: [
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
    {
      name: 'createdVia',
      label: 'Created Via',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'OAuth', value: 'oauth' },
      ],
    },
  ],
};
