import { signOut } from '@/auth/actions';
import { SupabaseStrategy } from '@/auth/strategy';
import { COLLECTION_GROUP, DOC_LOCK_DURATION, PROFILE_TYPES } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import { admin, anyone, userOwnerOrAdmin } from '../_access-control';
import { appendPermissions } from './hooks/afterMe';

export const Users: CollectionConfig<'users'> = {
  slug: 'users',
  admin: {
    group: COLLECTION_GROUP.USER,
    useAsTitle: 'email',
    defaultColumns: ['email', 'type', 'role', 'id'],
  },
  hooks: {
    afterMe: [appendPermissions],
    afterLogout: [signOut],
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [{ name: 'supabase-auth', authenticate: SupabaseStrategy }],
  },
  access: {
    admin: admin,
    read: userOwnerOrAdmin,
    create: anyone,
    update: userOwnerOrAdmin,
    delete: userOwnerOrAdmin,
  },
  disableDuplicate: true,
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
          name: 'email',
          type: 'text',
          unique: true,
          required: true,
          index: true,
        },
        {
          name: 'phone',
          type: 'text',
          unique: true,
          index: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'profileType',
          label: 'Profile Type',
          type: 'select',
          defaultValue: 'INDIVIDUAL',
          admin: { width: '50%' },
          options: Object.values(PROFILE_TYPES),
        },
        {
          name: 'profile',
          type: 'relationship',
          relationTo: ['individuals', 'milkBanks', 'hospitals'],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'lastSignInAt',
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
      name: 'picture',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
};
