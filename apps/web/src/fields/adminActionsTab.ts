import { Tab } from 'payload';

export const adminActionsTab = (): Tab => {
  return {
    name: 'adminActions',
    label: 'Admin Actions',
    fields: [
      {
        name: 'status',
        type: 'select',
        required: true,
        defaultValue: 'PENDING',
        options: [
          { label: 'Pending', value: 'PENDING' },
          { label: 'Approved', value: 'APPROVED' },
          { label: 'Matched', value: 'MATCHED' },
          { label: 'Fulfilled', value: 'FULFILLED' },
          { label: 'Rejected', value: 'REJECTED' },
          { label: 'Cancelled', value: 'CANCELLED' },
          { label: 'Expired', value: 'EXPIRED' },
        ],
      },
      {
        name: 'approvedBy',
        label: 'Approved By',
        type: 'relationship',
        relationTo: 'users',
        admin: {
          description: 'Healthcare provider who approved this donation',
          condition: (data) => ['APPROVED', 'MATCHED', 'FULFILLED'].includes(data.status),
        },
      },
      {
        name: 'approvalDate',
        label: 'Approval Date',
        type: 'date',
        admin: {
          description: 'Date when donation was approved',
          condition: (data) => ['APPROVED', 'MATCHED', 'FULFILLED'].includes(data.status),
        },
      },
      {
        name: 'rejectionReason',
        label: 'Rejection Reason',
        type: 'textarea',
        admin: {
          condition: (data) => data.status === 'REJECTED',
          description: 'Reason for rejection',
        },
      },
      {
        name: 'cancellationReason',
        label: 'Cancellation Reason',
        type: 'textarea',
        admin: {
          condition: (data) => data.status === 'CANCELLED',
          description: 'Reason for cancellation',
        },
      },
      {
        name: 'adminNotes',
        label: 'Admin Notes',
        type: 'textarea',
        admin: {
          description: 'Internal notes for administrators',
        },
      },
    ],
  };
};
