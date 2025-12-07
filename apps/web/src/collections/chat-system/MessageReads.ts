import { generateUser } from '@/hooks/collections/generateUser';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { MessageRead } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import status from 'http-status';
import { APIError, CollectionBeforeValidateHook, CollectionConfig } from 'payload';
import { authenticated, userOrAdmin } from '../_access-control';

const preventReadOwnMessages: CollectionBeforeValidateHook<MessageRead> = async ({
  req,
  operation,
  data,
}) => {
  if (!req.user || !data?.message) return data;

  if (!req.user.profile) {
    throw new APIError(
      'Unable to prevent reading own messages: User profile not found',
      status.BAD_REQUEST,
      {
        data: data,
        user: req.user,
      },
      true
    );
  }

  if (operation === 'create') {
    // Prevent reading your own messages
    const { sender } = await req.payload.findByID({
      req,
      collection: 'messages',
      id: extractID(data.message),
      depth: 0,
      select: { sender: true },
    });

    if (extractID(sender.value) === extractID(req.user.profile.value)) {
      throw new Error('Cannot mark your own message as read');
    }
  }

  return data;
};

export const MessageReads: CollectionConfig<'message-reads'> = {
  slug: 'message-reads',
  admin: {
    useAsTitle: 'message',
    group: COLLECTION_GROUP.CHAT,
    hidden: true,
  },
  access: {
    read: userOrAdmin,
    create: authenticated,
    update: () => false, // Read receipts are immutable
    delete: () => false,
  },
  timestamps: false,
  indexes: [
    {
      fields: ['message', 'user'],
      unique: true,
    },
  ],
  hooks: {
    beforeValidate: [preventReadOwnMessages],
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
      name: 'readAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
};

export default MessageReads;
