import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { TRANSACTION_STATUS } from '@lactalink/enums/transactions';
import { CollectionConfig } from 'payload';
import { admin } from '../_access-control';

export const TransactionStatusHistories: CollectionConfig<'transaction-status-histories'> = {
  slug: 'transaction-status-histories',
  admin: {
    group: COLLECTION_GROUP.TRANSACTION,
    hidden: true,
  },
  access: {
    admin: admin,
    read: admin,
    create: admin,
    update: admin,
    delete: admin,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      enumName: 'enum_transaction_status',
      options: Object.values(TRANSACTION_STATUS),
      required: true,
      admin: {
        readOnly: true,
        description: 'Status of the transaction at this point in time',
      },
    },

    {
      name: 'transaction',
      type: 'relationship',
      relationTo: 'transactions',
      required: true,
    },

    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      admin: {
        readOnly: true,
        description: 'Any additional notes related to this status change',
      },
    },
  ],
};
