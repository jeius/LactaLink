import { ID_VERIFICATION_URL } from '@/lib/constants/routes';
import { getServerSideURL } from '@/lib/utils/getURL';
import { ApiFetchResponse } from '@lactalink/types/api';
import { IDVerficationTask } from '@lactalink/types/payload-generated-types';
import { APIError, TaskConfig } from 'payload';

export const idVerificationTask: TaskConfig<'id-verification-task'> = {
  slug: 'id-verification-task',
  label: 'ID Verification',
  retries: 1,
  interfaceName: 'IDVerficationTask',
  inputSchema: [
    { name: 'refImageUrl', type: 'text', required: true, label: 'Reference Image URL' },
    { name: 'queryImageUrl', type: 'text', required: true, label: 'Query Image URL' },
    { name: 'identityID', type: 'text', required: true, label: 'Identity ID' },
  ],
  outputSchema: [
    { name: 'isVerified', type: 'checkbox', required: true, label: 'Is Verified' },
    { name: 'label', type: 'text', required: true, label: 'Label' },
    { name: 'distance', type: 'number', required: true, label: 'Distance' },
  ],
  handler: async ({ input: inputArg, req }) => {
    const { identityID } = inputArg;
    req.payload.logger.info(`Starting ID verification for identity ${identityID}`);

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }

    const url = new URL(ID_VERIFICATION_URL, getServerSideURL());
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(inputArg),
    });

    const resData: ApiFetchResponse<IDVerficationTask['output']> = await response.json();

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

    return { output: data, state: 'succeeded' };
  },
};
