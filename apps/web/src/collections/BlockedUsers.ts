import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { isAdmin } from '@/lib/utils/isAdmin';
import status from 'http-status';
import { APIError, CollectionConfig } from 'payload';
import { authenticated } from './_access-control';

const BlockedUsers: CollectionConfig<'blocked-users'> = {
  slug: 'blocked-users',
  admin: {
    useAsTitle: 'blocked',
    group: COLLECTION_GROUP.CONTENT,
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (isAdmin(user)) return true;
      // Only blocker can see their blocked users
      return { blocker: { equals: user.id } };
    },
    create: authenticated,
    update: () => false,
    delete: ({ req: { user } }) => {
      if (!user) return false;
      if (isAdmin(user)) return true;
      // Only blocker can unblock
      return { blocker: { equals: user.id } };
    },
  },
  fields: [
    {
      name: 'blocker',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'blocked',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
  ],
  indexes: [
    {
      fields: ['blocker', 'blocked'],
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        if (!req.user) return data;

        if (operation === 'create') {
          data.blocker = req.user.id;

          // Prevent self-blocking
          if (data.blocker === data.blocked) {
            throw new APIError(
              'Cannot block yourself',
              status.BAD_REQUEST,
              {
                blocker: data.blocker,
                blocked: data.blocked,
              },
              true
            );
          }
        }

        return data;
      },
    ],
  },
};

export default BlockedUsers;
