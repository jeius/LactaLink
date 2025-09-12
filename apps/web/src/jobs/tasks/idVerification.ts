import { getServerApi } from '@/lib/api/getServerApi';
import { ID_VERIFICATION_URL } from '@/lib/constants/routes';
import { createActionNeededEmailTemplate } from '@/lib/emailTemplates/adminActionNeeded';
import { getServerSideURL } from '@/lib/utils/getURL';
import { ID_STATUS } from '@lactalink/enums';
import { ApiFetchResponse } from '@lactalink/types';
import { APIError, TaskConfig } from 'payload';

export const idVerification: TaskConfig<'id-verification'> = {
  slug: 'id-verification',
  label: 'ID Verification',
  retries: 1,
  interfaceName: 'IDVerficationTask',
  inputSchema: [
    { name: 'refImageUrl', type: 'text', required: true, label: 'Reference Image URL' },
    { name: 'queryImageUrl', type: 'text', required: true, label: 'Query Image URL' },
    { name: 'identityID', type: 'text', required: true, label: 'Identity ID' },
    { name: 'email', type: 'text', required: true, label: 'User Email' },
  ],
  outputSchema: [
    {
      name: 'identity',
      type: 'relationship',
      relationTo: 'identities',
      label: 'Identity',
      required: true,
    },
  ],
  handler: async ({ input: { identityID, email: userEmail, ...input }, req }) => {
    const headers = new Headers({ 'Content-Type': 'application/json' });

    const apiClient = await getServerApi();
    const authToken = await apiClient.auth.getToken();
    if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

    req.payload.logger.info(`Starting ID verification for identity ${identityID}`);

    const url = new URL(ID_VERIFICATION_URL, getServerSideURL());
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    const resData: ApiFetchResponse<{ isVerified: boolean }> = await response.json();

    if ('error' in resData) {
      throw new APIError(
        `ID Verification failed: ${response.statusText}`,
        response.status,
        null,
        true
      );
    }

    const data = resData.data;

    req.payload.logger.info(data, `ID Verification result for identity ${identityID}`);

    // If verified, update the identity status to 'APPROVED' and return the identity
    if (data.isVerified === true) {
      const approvedStatus = ID_STATUS.APPROVED.value;

      req.payload.logger.info(`Updating status to ${approvedStatus}.`);

      const updatedIdentity = await req.payload.update({
        collection: 'identities',
        id: identityID,
        data: { status: approvedStatus },
        req,
        user: null,
        depth: 0,
        overrideAccess: true,
      });

      req.payload.logger.info(`Successfully updated identity to status ${approvedStatus}`);

      return { output: { identity: updatedIdentity }, state: 'succeeded' };
    }

    req.payload.logger.warn(`Sending email to admins for manual review.`);

    // Send email notification to all admin about the failed verification
    // so the admin will manually review the identity.
    const { docs: admins } = await req.payload.find({
      collection: 'users',
      where: { role: { equals: 'ADMIN' } },
      req,
      depth: 0,
      overrideAccess: true,
      select: { email: true },
    });

    if (admins.length) {
      const sendEmails = admins.map(({ email: adminEmail }) => {
        return req.payload.sendEmail({
          to: adminEmail,
          subject: 'Manual ID Verification',
          html: createActionNeededEmailTemplate({
            userEmail: userEmail,
            actionUrl: `${getServerSideURL()}/admin/collections/identities/${identityID}`,
          }),
        });
      });

      await Promise.all(sendEmails);

      req.payload.logger.info(`Sent email to ${admins.length} admin(s).`);
    }

    // Return the identity with status set to 'REQUIRED_ACTION'
    // so the admin can manually review the identity.
    const identity = await req.payload.update({
      collection: 'identities',
      id: identityID,
      data: { status: ID_STATUS.REQUIRED_ACTION.value },
      req,
      user: null,
      depth: 0,
      overrideAccess: true,
    });

    req.payload.logger.info(`Set identity status to ${ID_STATUS.REQUIRED_ACTION.value}.`);

    return { output: { identity }, state: 'succeeded' };
  },
};
