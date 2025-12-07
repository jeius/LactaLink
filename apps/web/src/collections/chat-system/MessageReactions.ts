import { generateUser } from '@/hooks/collections/generateUser';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { CollectionConfig } from 'payload';
import { authenticated, userOrAdmin } from '../_access-control';

const MessageReactions: CollectionConfig = {
  slug: 'message-reactions',
  admin: {
    useAsTitle: 'emoji',
    group: COLLECTION_GROUP.CHAT,
    hidden: true,
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: () => false,
    delete: userOrAdmin,
  },
  indexes: [
    {
      fields: ['message', 'user', 'emoji'],
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [generateUser],
  },
  fields: [
    {
      name: 'message',
      type: 'relationship',
      relationTo: 'messages',
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
      name: 'emoji',
      type: 'text',
      required: true,
      maxLength: 10,
      // validate: (value) => {
      //   // Basic emoji validation
      //   const emojiRegex = /^[\u{1F300}-\u{1F9FF}]$/u;
      //   if (!emojiRegex.test(value)) {
      //     return 'Invalid emoji';
      //   }
      //   return true;
      // },
    },
  ],
};

export default MessageReactions;
