import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { isAdmin } from '@/lib/utils/isAdmin';
import { TRANSACTION_EVENT_TYPES } from '@lactalink/enums';
import { Access, CollectionConfig } from 'payload';
import { admin, authenticated } from '../../_access-control';
import { afterChange } from './hooks/afterChange';

const actorOrAdmin: Access = ({ req }) => {
  if (!req.user) return false;
  if (isAdmin(req.user)) return true;
  return { actor: { equals: req.user.id } };
};

export const TransactionEvents: CollectionConfig<'transaction-events'> = {
  slug: 'transaction-events',
  access: {
    admin: admin,
    create: authenticated,
    read: actorOrAdmin,
    update: admin, // Only admins can update events
    delete: admin, // Only admins can delete events
  },
  admin: {
    group: COLLECTION_GROUP.DONATIONS,
    useAsTitle: 'type',
    defaultColumns: ['transaction', 'type', 'actor', 'timestamp'],
  },
  hooks: {
    afterChange: [afterChange],
  },
  fields: [
    {
      name: 'transaction',
      type: 'relationship',
      relationTo: 'transactions',
      required: true,
      index: true,
      admin: {
        description: 'The transaction this event belongs to',
      },
    },

    {
      name: 'type',
      type: 'select',
      required: true,
      enumName: 'enum_transaction_event_types',
      options: Object.values(TRANSACTION_EVENT_TYPES),
      admin: {
        description: 'Type of event that occurred',
      },
    },

    {
      name: 'payload',
      type: 'json',
      admin: {
        description: 'Event-specific data (e.g., proposal details, status change reason)',
      },
    },

    {
      name: 'actor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Who triggered this event',
      },
    },

    {
      name: 'timestamp',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'When this event occurred',
        date: {
          displayFormat: 'd MMM yyy HH:mm a',
          pickerAppearance: 'dayAndTime',
        },
      },
    },

    {
      name: 'sequenceNumber',
      type: 'number',
      admin: {
        description: 'Sequential number for ordering events (auto-generated)',
        readOnly: true,
      },
    },
  ],
  indexes: [
    {
      fields: ['transaction', 'timestamp'],
    },
    {
      fields: ['transaction', 'sequenceNumber'],
      unique: true,
    },
  ],
};
