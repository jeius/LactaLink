import { collectionEndpoints } from '@/auth/endpoints';
import { SupabaseStrategy } from '@/auth/strategy';
import { COLLECTION_GROUP, DOC_LOCK_DURATION } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import { adminAccessControl } from './access/admin';
import { supabaseSignOut } from './hooks/afterLogout';
import { supabaseSignUp } from './hooks/beforeCreate';
import { supabaseSignIn } from './hooks/beforeOperation';

export const Users: CollectionConfig<'users'> = {
  slug: 'users',
  admin: {
    group: COLLECTION_GROUP.USER,
    useAsTitle: 'email',
    defaultColumns: ['email', 'type', 'role', 'id'],
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
    admin: adminAccessControl,
    read: ({ req }) => Boolean(req.user),
    create: () => true,
  },
  disableDuplicate: true,
  endpoints: collectionEndpoints,
  lockDocuments: { duration: DOC_LOCK_DURATION },
  fields: [
    {
      name: 'role',
      type: 'radio',
      defaultValue: 'AUTHENTICATED',
      options: [
        { label: 'Authenticated', value: 'AUTHENTICATED' },
        { label: 'Admin', value: 'ADMIN' },
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
          defaultValue: 'INDIVIDUAL',
          admin: { width: '30%' },
          options: [
            {
              label: 'Individual',
              value: 'INDIVIDUAL',
            },
            {
              label: 'Hospital',
              value: 'HOSPITAL',
            },
            {
              label: 'Milk Bank',
              value: 'MILK_BANK',
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
    {
      name: 'createdVia',
      type: 'select',
      defaultValue: 'EMAIL_PASSWORD',
      options: [
        { label: 'Email and Password', value: 'EMAIL_PASSWORD' },
        { label: 'OAuth', value: 'OAUTH' },
        { label: 'Magic Link', value: 'MAGIC_LINK' },
        { label: 'Phone', value: 'PHONE' },
        { label: 'Phone and Password', value: 'PHONE_PASSWORD' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
};
