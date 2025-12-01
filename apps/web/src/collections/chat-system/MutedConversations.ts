import { generateUser } from '@/hooks/collections/generateUser';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { isAdmin } from '@/lib/utils/isAdmin';
import { Access, CollectionConfig } from 'payload';
import { authenticated } from '../_access-control';

const userOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return { user: { equals: user.id } };
};

const MutedConversations: CollectionConfig<'muted-conversations'> = {
  slug: 'muted-conversations',
  admin: {
    useAsTitle: 'conversation',
    group: COLLECTION_GROUP.CHAT,
  },
  access: {
    read: userOrAdmin,
    create: authenticated,
    update: userOrAdmin,
    delete: userOrAdmin,
  },
  fields: [
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: 'conversations',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'mutedUntil',
      type: 'date',
      admin: {
        description: 'Leave empty for permanent mute',
        position: 'sidebar',
      },
    },
  ],
  indexes: [
    {
      fields: ['conversation', 'user'],
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [generateUser],
  },
};

export default MutedConversations;
