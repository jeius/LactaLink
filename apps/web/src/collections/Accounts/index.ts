import { collectionGroup } from '@/lib/constants';
import type { CollectionConfig } from 'payload';

export const Accounts: CollectionConfig<'accounts'> = {
  slug: 'accounts',
  admin: {
    group: collectionGroup.user,
    useAsTitle: 'user',
  },
  fields: [
    {
      name: 'providerAccountId',
      type: 'text',
      required: true,
      admin: {
        description: 'The unique ID of the user from the provider',
      },
    },
    {
      name: 'provider',
      type: 'select',
      options: [
        {
          label: 'Google',
          value: 'google',
        },
        {
          label: 'Facebook',
          value: 'facebook',
        },
      ],
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'OAuth',
          value: 'oauth',
        },
        {
          label: 'Phone',
          value: 'phone',
        },
      ],
    },
    {
      name: 'givenName',
      type: 'text',
      admin: {
        description: 'Given name of the user from the provider',
      },
    },
    {
      name: 'familyName',
      type: 'text',
      admin: {
        description: 'Family name of the user from the provider',
      },
    },
    {
      name: 'picture',
      type: 'text',
      admin: {
        description: 'URL to the profile picture',
      },
    },
    {
      name: 'accessToken',
      type: 'text',
      admin: {
        description: 'Access token from the provider',
      },
    },
    {
      name: 'expiration',
      type: 'number',
      admin: {
        description: 'Expiration time of the access token in seconds',
      },
    },
    {
      name: 'refreshToken',
      type: 'text',
      admin: {
        description: 'Refresh token from the provider',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
};
