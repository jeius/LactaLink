import { DELIVERY_OPTIONS, TRANSACTION_STATUS, TRANSACTION_TYPE } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { Field } from 'payload';

export const proposedField: Field = {
  name: 'proposed',
  label: 'Proposed Delivery',
  interfaceName: 'ProposedDelivery',
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
      enumName: 'enum_delivery_modes',
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
      type: 'relationship',
      relationTo: ['individuals', 'hospitals', 'milkBanks'],
      hasMany: false,
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'proposedAt',
      label: 'Proposed At',
      type: 'date',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'agreements',
      interfaceName: 'DeliveryAgreements',
      type: 'group',
      admin: {
        description: 'Tracks delivery proposal agreement status from both parties',
      },
      fields: [
        {
          name: 'sender',
          type: 'group',
          fields: [
            {
              name: 'agreed',
              type: 'checkbox',
              label: 'Sender Agreed',
              defaultValue: false,
              admin: { readOnly: true },
            },
            {
              name: 'agreedBy',
              type: 'relationship',
              relationTo: ['individuals', 'hospitals', 'milkBanks'],
              hasMany: false,
              admin: {
                condition: (_, siblingData) => siblingData?.agreed === true,
                readOnly: true,
              },
            },
            {
              name: 'agreedAt',
              type: 'date',
              admin: {
                condition: (_, siblingData) => siblingData?.agreed === true,
                readOnly: true,
              },
            },
          ],
        },
        {
          name: 'recipient',
          type: 'group',
          fields: [
            {
              name: 'agreed',
              type: 'checkbox',
              label: 'Recipient Agreed',
              defaultValue: false,
              admin: { readOnly: true },
            },
            {
              name: 'agreedBy',
              type: 'relationship',
              relationTo: ['individuals', 'hospitals', 'milkBanks'],
              hasMany: false,
              admin: {
                condition: (_, siblingData) => siblingData?.agreed === true,
                readOnly: true,
              },
            },
            {
              name: 'agreedAt',
              type: 'date',
              admin: {
                condition: (_, siblingData) => siblingData?.agreed === true,
                readOnly: true,
              },
            },
          ],
        },
        {
          name: 'bothAgreed',
          type: 'checkbox',
          admin: {
            readOnly: true,
            description: 'Automatically checked when both sender and recipient have agreed',
          },
          hooks: {
            beforeChange: [
              ({ siblingData }) => {
                return (
                  siblingData?.sender?.agreed === true && siblingData?.recipient?.agreed === true
                );
              },
            ],
          },
        },
      ],
    },
  ],
};

export const confirmedField: Field = {
  name: 'confirmed',
  label: 'Confirmed Delivery',
  interfaceName: 'ConfirmedDelivery',
  type: 'group',
  fields: [
    {
      name: 'mode',
      type: 'radio',
      enumName: 'enum_delivery_modes',
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
    {
      name: 'confirmedAt',
      label: 'Confirmed At',
      type: 'date',
      required: true,
      admin: { readOnly: true },
    },
  ],
  admin: {
    condition: () => true,
  },
};
