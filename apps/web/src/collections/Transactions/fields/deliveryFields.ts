import {
  DELIVERY_OPTIONS,
  TRANSACTION_PROPOSED_BY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@/lib/constants';
import { Transaction } from '@lactalink/types';
import { Field } from 'payload';

export const proposedField: Field = {
  name: 'proposedDelivery',
  labels: { singular: 'Proposed Delivery', plural: 'Proposed Deliveries' },
  type: 'array',
  admin: {
    condition: (data: Partial<Transaction>) =>
      data.transactionType === TRANSACTION_TYPE.P2P.value &&
      data.status === TRANSACTION_STATUS.PENDING_DELIVERY_CONFIRMATION.value,
  },
  fields: [
    {
      name: 'mode',
      type: 'radio',
      required: true,
      options: Object.values(DELIVERY_OPTIONS),
    },
    {
      name: 'datetime',
      label: 'Proposed Date and Time',
      type: 'date',
      required: true,
    },
    {
      name: 'address',
      label: 'Proposed Address',
      type: 'relationship',
      relationTo: 'addresses',
      required: true,
    },
    {
      name: 'proposedBy',
      label: 'Proposed By',
      type: 'select',
      enumName: 'enum_transaction_proposed_by',
      required: true,
      options: Object.values(TRANSACTION_PROPOSED_BY),
      admin: { readOnly: true },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'senderAgreed',
          type: 'checkbox',
          label: 'Sender Agreed',
          admin: {
            readOnly: true,
            description: 'Indicates if the sender has agreed to this proposed delivery',
            width: '25%',
          },
        },
        {
          name: 'recipientAgreed',
          type: 'checkbox',
          label: 'Recipient Agreed',
          admin: {
            readOnly: true,
            description: 'Indicates if the recipient has agreed to this proposed delivery',
            width: '25%',
          },
        },
      ],
    },
  ],
};

export const confirmedField: Field = {
  name: 'confirmedDelivery',
  label: 'Confirmed Delivery',
  type: 'group',
  fields: [
    {
      name: 'mode',
      type: 'radio',
      required: true,
      options: Object.values(DELIVERY_OPTIONS),
    },
    {
      name: 'datetime',
      label: 'Confirmed Date and Time',
      type: 'date',
      required: true,
    },
    {
      name: 'address',
      label: 'Confirmed Address',
      type: 'relationship',
      relationTo: 'addresses',
      required: true,
    },
  ],
  admin: {
    condition: (data: Partial<Transaction>) =>
      data.status === TRANSACTION_STATUS.DELIVERY_SCHEDULED.value,
  },
};
