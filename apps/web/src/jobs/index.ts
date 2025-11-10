import { admin } from '@/collections/_access-control';
import { COLLECTION_GROUP } from '@/lib/constants';
import { JobsConfig } from 'payload';
import tasks from './tasks';
import { idVerificationWorkflow } from './workflows/idVerification';

export const jobs: JobsConfig = {
  access: {
    run: ({ req: { user } }) => Boolean(user),
  },
  tasks: tasks,
  workflows: [idVerificationWorkflow],
  jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
    ...defaultJobsCollection,
    admin: {
      ...defaultJobsCollection.admin,
      group: COLLECTION_GROUP.SYSTEM,
      hidden: false,
      defaultColumns: ['id', 'queue', 'processing', 'hasError', 'createdAt', 'completedAt'],
    },
    access: {
      read: admin,
      create: () => false,
      update: () => false,
      delete: admin,
    },
    labels: {
      singular: 'System Job',
      plural: 'System Jobs',
    },
  }),
};
