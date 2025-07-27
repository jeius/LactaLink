import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Tab } from 'payload';

export const organizationDetailsTab = (collection: 'donation' | 'request'): Tab => {
  return {
    label: 'Organization Details',
    fields: [
      {
        name: 'approvedAt',
        label: 'Approval Date',
        type: 'date',
        admin: {
          description: `Date when ${collection} was approved`,
          condition: (data) => data.status === DONATION_REQUEST_STATUS.APPROVED.value,
        },
      },
      {
        name: 'rejectedAt',
        label: 'Rejection Date',
        type: 'date',
        admin: {
          description: `Date when ${collection} was rejected`,
          condition: (data) => data.status === DONATION_REQUEST_STATUS.REJECTED.value,
        },
      },
      {
        name: 'rejectionReason',
        label: 'Rejection Reason',
        type: 'textarea',
        admin: {
          condition: (data) => data.status === DONATION_REQUEST_STATUS.REJECTED.value,
          description: 'Reason for rejection',
        },
      },
      {
        name: 'notes',
        label: 'Notes (Internal)',
        type: 'textarea',
        admin: {
          description: 'Internal notes for administrators',
        },
      },
    ],
  };
};
