import { collectionEndpoints } from '@/auth/endpoints';
import { SupabaseStrategy } from '@/auth/strategy';
import { COLLECTION_GROUP, DOC_LOCK_DURATION } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import { supabaseSignOut } from './hooks/afterLogout';
import { supabaseSignUp } from './hooks/beforeCreate';
import { supabaseSignIn } from './hooks/beforeOperation';

export const Users: CollectionConfig<'users'> = {
  slug: 'users',
  admin: {
    group: COLLECTION_GROUP.USER,
    useAsTitle: 'email',
    defaultColumns: ['email', 'type', 'id'],
  },
  hooks: {
    beforeChange: [supabaseSignUp],
    beforeOperation: [supabaseSignIn],
    afterLogout: [supabaseSignOut],
  },
  auth: {
    strategies: [{ name: 'supabase-auth', authenticate: SupabaseStrategy }],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
  },
  disableDuplicate: true,
  endpoints: collectionEndpoints,
  lockDocuments: { duration: DOC_LOCK_DURATION },
  fields: [
    {
      name: 'role',
      type: 'radio',
      defaultValue: 'authenticated',
      options: [
        { label: 'Authenticated', value: 'authenticated' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          unique: true,
          index: true,
          admin: { width: '30%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'individual',
          required: true,
          admin: { width: '30%' },
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
    },
    {
      name: 'lastSignInAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'confirmedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'emailConfirmedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'phoneConfirmedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
};
