import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { Field, FieldHook } from 'payload';

const deliveredStatus = TRANSACTION_STATUS.DELIVERED.value;
const completedStatus = TRANSACTION_STATUS.COMPLETED.value;
const failedStatus = TRANSACTION_STATUS.FAILED.value;
const cancelledStatus = TRANSACTION_STATUS.CANCELLED.value;

const createTimeStampFieldHook = (status: Transaction['status']): FieldHook<Transaction> => {
  return ({ value, data }) => {
    if (value && value !== '') return value;
    if (data?.status !== status) return value;
    return new Date().toISOString();
  };
};

export const trackingField: Field = {
  name: 'tracking',
  label: 'Tracking & Status',
  type: 'group',
  required: true,
  admin: {
    description: 'Tracks the status and reads of the transaction',
  },
  fields: [
    {
      name: 'reads',
      label: 'Reads',
      type: 'join',
      collection: 'transaction-reads',
      on: 'transaction',
      maxDepth: 2,
      admin: {
        description: 'Users who have read this transaction',
        defaultColumns: ['user', 'createdAt'],
      },
    },

    {
      name: 'deliveredAt',
      label: 'Delivered At',
      type: 'date',
      admin: {
        condition: (data: Partial<Transaction>) =>
          data.status === deliveredStatus || data.status === completedStatus,
        readOnly: true,
      },
      hooks: {
        beforeChange: [createTimeStampFieldHook(deliveredStatus)],
      },
    },

    {
      name: 'completedAt',
      label: 'Completed At',
      type: 'date',
      admin: {
        condition: (data) => data.status === completedStatus,
        readOnly: true,
      },
      hooks: {
        beforeChange: [createTimeStampFieldHook(completedStatus)],
      },
    },

    {
      name: 'failedAt',
      label: 'Failed At',
      type: 'date',
      admin: {
        condition: (data) => data.status === failedStatus,
        readOnly: true,
      },
      hooks: {
        beforeChange: [createTimeStampFieldHook(failedStatus)],
      },
    },

    {
      name: 'failureReason',
      label: 'Failure Reason',
      type: 'textarea',
      admin: {
        condition: (data) => data.status === failedStatus,
        readOnly: true,
      },
    },

    {
      name: 'cancelledAt',
      label: 'Cancelled At',
      type: 'date',
      admin: {
        condition: (data) => data.status === cancelledStatus,
        readOnly: true,
      },
      hooks: {
        beforeChange: [createTimeStampFieldHook(cancelledStatus)],
      },
    },

    {
      name: 'cancelReason',
      label: 'Cancel Reason',
      type: 'textarea',
      admin: {
        condition: (data) => data.status === cancelledStatus,
        readOnly: true,
      },
    },

    {
      name: 'statusHistory',
      label: 'Status History',
      type: 'join',
      collection: 'transaction-status-histories',
      on: 'transaction',
      maxDepth: 2,
      defaultSort: '-createdAt',
      admin: {
        description: 'History of status changes for this transaction',
        defaultColumns: ['status', 'notes', 'createdAt'],
      },
    },
  ],
};
