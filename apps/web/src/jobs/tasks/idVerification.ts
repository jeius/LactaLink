import { ID_VERIFICATION_URL } from '@/lib/constants/routes';
import { TaskConfig } from 'payload';

export const idVerification: TaskConfig<'id-verification'> = {
  slug: 'id-verification',
  label: 'ID Verification',
  retries: 1,
  interfaceName: 'IDVerficationTask',
  inputSchema: [
    { name: 'refImageUrl', type: 'text', required: true, label: 'Reference Image URL' },
    { name: 'queryImageUrl', type: 'text', required: true, label: 'Query Image URL' },
  ],
  outputSchema: [
    { name: 'isVerified', type: 'checkbox', required: true, label: 'Is Verified' },
    { name: 'label', type: 'text', required: true, label: 'Label' },
    { name: 'distance', type: 'number', required: true, label: 'Distance' },
  ],
  handler: async ({ input, req }) => {
    const headers = new Headers(req.headers);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(ID_VERIFICATION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`ID Verification failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { output: data, state: 'succeeded' };
  },
};
