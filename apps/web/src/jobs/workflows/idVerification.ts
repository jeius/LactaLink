import { JOB_QUEUES } from '@/lib/constants/jobs';
import { createActionNeededEmailTemplate } from '@/lib/emailTemplates/adminActionNeeded';
import { getServerSideURL } from '@/lib/utils/getURL';
import { ID_STATUS } from '@lactalink/enums/identities';
import { Identity } from '@lactalink/types';
import { WorkflowConfig } from 'payload';

const DEFAULT_RETRIES = 2;

export const idVerificationWorkflow: WorkflowConfig<'id-verification-workflow'> = {
  slug: 'id-verification-workflow',
  label: 'ID Verification Workflow',
  interfaceName: 'IDVerificationWorkflow',
  retries: DEFAULT_RETRIES,
  queue: JOB_QUEUES['id-verification'],
  inputSchema: [
    { name: 'refImageUrl', type: 'text', required: true, label: 'Reference Image URL' },
    { name: 'queryImageUrl', type: 'text', required: true, label: 'Query Image URL' },
    { name: 'identityID', type: 'text', required: true, label: 'Identity ID' },
    { name: 'email', type: 'text', required: true, label: 'User Email' },
  ],
  handler: async ({ job, req, tasks, inlineTask }) => {
    const { identityID, email, ...input } = job.input;

    const verificationTaskID = `job-${job.id}-id-verification`;
    const updateStatusTaskID = `job-${job.id}-update-identity-status`;

    const { isVerified } = await tasks['id-verification-task'](verificationTaskID, {
      input: { ...input, identityID },
      retries: DEFAULT_RETRIES,
    });

    const defaultQueryOptions = { req, depth: 0, overrideAccess: true };

    async function updateIdentityTask(status: Identity['status']) {
      return await inlineTask(updateStatusTaskID, {
        input: { id: identityID, status },
        retries: DEFAULT_RETRIES,
        task: async ({ input: { id, status }, req }) => {
          const doc = await req.payload.update({
            collection: 'identities',
            id,
            data: { status },
            user: null,
            ...defaultQueryOptions,
          });

          return { output: doc, state: 'succeeded' };
        },
      });
    }

    // If verified, update the identity status to 'APPROVED' and return the identity
    if (isVerified) {
      const approvedStatus = ID_STATUS.APPROVED.value;

      req.payload.logger.info(`Updating status to ${approvedStatus}.`);

      await updateIdentityTask(approvedStatus);

      req.payload.logger.info(`Successfully updated identity status to ${approvedStatus}`);
    } else {
      // At this point, the automated verification system has failed
      // to verify the identity therefore we will need the admins to do
      // a manual review of the identity.

      // Get the admin users
      const { docs: admins } = await req.payload.find({
        collection: 'users',
        where: { role: { equals: 'ADMIN' } },
        select: { email: true },
        ...defaultQueryOptions,
      });

      // Send email notification to all admin about the failed verification
      if (admins.length) {
        // Prepare sending email tasks
        const sendEmails = admins.map(({ email: adminEmail }) => {
          const sendEmailTaskID = `job-${job.id}-send-email-to-${adminEmail}`;
          return tasks['send-email'](sendEmailTaskID, {
            retries: DEFAULT_RETRIES,
            input: {
              to: adminEmail,
              subject: 'Manual ID Verification',
              html: createActionNeededEmailTemplate({
                userEmail: email,
                actionUrl: `${getServerSideURL()}/admin/collections/identities/${identityID}`,
              }),
            },
          });
        });

        req.payload.logger.warn(`Sending email to admins for manual review.`);

        // Send emails in parallel
        const sendResults = await Promise.all(sendEmails);

        // Log the results
        const { successCount, failedCount } = sendResults.reduce(
          (acc, { sent }) => {
            if (sent) acc.successCount += 1;
            else acc.failedCount += 1;
            return acc;
          },
          { successCount: 0, failedCount: 0 }
        );

        req.payload.logger.info(
          `Sent ${successCount} email(s) to admins for manual ID verification, ${failedCount} failed.`
        );
      }

      const actionRequiredStatus = ID_STATUS.REQUIRED_ACTION.value;

      await updateIdentityTask(actionRequiredStatus);

      req.payload.logger.info(`Successfully updated identity status to ${actionRequiredStatus}.`);
    }
  },
};
