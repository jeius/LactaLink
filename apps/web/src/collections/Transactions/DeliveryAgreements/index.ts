import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { DELIVERY_DECISIONS } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { admin, authenticated, userOrAdmin } from '../../_access-control';
import { involvedUserOrAdmin } from './access';

export const DeliveryAgreements: CollectionConfig<'delivery-agreements'> = {
  slug: 'delivery-agreements',
  access: {
    admin: admin,
    create: authenticated,
    read: involvedUserOrAdmin,
    update: userOrAdmin,
    delete: admin,
  },
  admin: {
    group: COLLECTION_GROUP.TRANSACTION,
    hidden: true,
    useAsTitle: 'decision',
    defaultColumns: ['decision', 'user', 'deliveryDetails', 'decidedAt'],
  },
  fields: [
    {
      name: 'deliveryDetails',
      type: 'relationship',
      relationTo: 'delivery-details',
      required: true,
      index: true,
      admin: {
        description: 'The delivery this agreement is for',
      },
    },

    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'The user (sender or recipient) who is agreeing',
      },
    },

    {
      name: 'decision',
      type: 'select',
      enumName: 'enum_delivery_agreement_decision',
      options: Object.values(DELIVERY_DECISIONS),
      required: true,
      admin: {
        description: 'The decision made by the user',
      },
    },

    {
      name: 'decidedAt',
      label: 'Decided At',
      type: 'date',
      required: true,
      admin: {
        description: 'When the party agreed or declined',
        readOnly: true,
        date: {
          displayFormat: 'd MMM yyy HH:mm a',
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  indexes: [
    {
      fields: ['deliveryDetails', 'user'],
      unique: true,
    },
  ],
};
