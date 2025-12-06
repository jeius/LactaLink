import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants';
import { isAdmin } from '@/lib/utils/isAdmin';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionConfig, Field } from 'payload';
import { authenticated, collectionCreatorOrAdmin } from '../_access-control/general';
import { deleteRelatedAttachment } from './_hooks/afterDeleteAttachments';

const MessageAttachments: CollectionConfig<'message-attachments'> = {
  slug: 'message-attachments',
  admin: {
    group: COLLECTION_GROUP.CHAT,
    hidden: true,
  },
  access: {
    read: async ({ req: { user }, req }) => {
      if (!user) return false;
      if (isAdmin(user)) return true;

      const { values } = await req.payload.findDistinct({
        collection: 'conversation-participants',
        where: { participant: { equals: user.id } },
        limit: 0,
        depth: 0,
        req,
        field: 'conversation',
        sort: 'conversation',
      });

      const ids = values.map((p) => extractID(p.conversation));

      // Users can only access attachments from conversations they're part of
      return { 'message.conversation': { in: ids } };
    },
    create: authenticated,
    update: () => false,
    delete: collectionCreatorOrAdmin,
  },
  fields: [
    {
      name: 'message',
      type: 'relationship',
      relationTo: 'messages',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'attachment',
      type: 'relationship',
      required: true,
      relationTo: ['donations', 'requests', 'message-media'],
      admin: {
        readOnly: true,
      },
    },
    { ...createdByField, required: true } as Field,
  ],
  hooks: {
    beforeChange: [generateCreatedBy],
    afterDelete: [deleteRelatedAttachment],
  },
};

export default MessageAttachments;
