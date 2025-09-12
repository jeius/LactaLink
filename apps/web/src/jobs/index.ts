import { JobsConfig } from 'payload';
import { idVerification } from './tasks/idVerification';

export const jobs: JobsConfig = {
  access: {
    run: ({ req: { user } }) => Boolean(user),
  },
  tasks: [idVerification],
};
