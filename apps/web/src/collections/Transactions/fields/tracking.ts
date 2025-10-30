import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { Field } from 'payload';

const deliveredStatus = TRANSACTION_STATUS.DELIVERED.value;
const completedStatus = TRANSACTION_STATUS.COMPLETED.value;
const failedStatus = TRANSACTION_STATUS.FAILED.value;
const cancelledStatus = TRANSACTION_STATUS.CANCELLED.value;

export const trackingField: Field = {
  name: 'tracking',
  label: 'Tracking & Status',
  type: 'group',
  fields: [
    {
      name: 'seenStatus',
      label: 'Seen Status',
      type: 'array',
      fields: [
        {
          name: 'seen',
          label: 'Seen',
          type: 'checkbox',
        },
        {
          name: 'seenAt',
          label: 'Seen At',
          type: 'date',
        },
        {
          name: 'seenBy',
          label: 'Seen By',
          type: 'relationship',
          relationTo: ['individuals', 'hospitals', 'milkBanks'],
          filterOptions: ({ data }: { data: Partial<Transaction> }) => {
            if (!data.sender || !data.recipient) return true;
            return { id: { in: [extractID(data.sender.value), extractID(data.recipient.value)] } };
          },
        },
      ],
    },
    {
      name: 'deliveredAt',
      label: 'Delivered At',
      type: 'date',
      admin: {
        condition: (data: Partial<Transaction>) =>
          data.status === deliveredStatus || data.status === completedStatus,
      },
    },
    {
      name: 'completedAt',
      label: 'Completed At',
      type: 'date',
      admin: {
        condition: (data) => data.status === completedStatus,
      },
    },
    {
      name: 'failedAt',
      label: 'Failed At',
      type: 'date',
      admin: {
        condition: (data) => data.status === failedStatus,
      },
    },
    {
      name: 'failureReason',
      label: 'Failure Reason',
      type: 'textarea',
      admin: {
        condition: (data) => data.status === failedStatus,
      },
    },
    {
      name: 'cancelledAt',
      label: 'Cancelled At',
      type: 'date',
      admin: {
        condition: (data) => data.status === cancelledStatus,
      },
    },
    {
      name: 'cancelReason',
      label: 'Cancel Reason',
      type: 'textarea',
      admin: {
        condition: (data) => data.status === cancelledStatus,
      },
    },
    {
      name: 'statusHistory',
      label: 'Status History',
      type: 'array',
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
          name: 'timestamp',
          type: 'date',
          required: true,
          admin: {
            readOnly: true,
            description: 'Timestamp when this status was recorded',
          },
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
    },
  ],
};
