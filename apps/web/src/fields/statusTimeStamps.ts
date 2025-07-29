import { Field } from 'payload';

export const statusTimeStamps: Field[] = [
  {
    name: 'completedAt',
    type: 'date',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
  },
  {
    name: 'cancelledAt',
    type: 'date',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
  },
  {
    name: 'rejectedAt',
    type: 'date',
    admin: {
      position: 'sidebar',
      readOnly: true,
    },
  },
];
