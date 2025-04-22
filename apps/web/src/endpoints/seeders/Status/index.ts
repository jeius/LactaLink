import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';

export const seedStatus: string[] = [];

export const seedStatusHandler = createPayloadHandler({
  requireAdmin: true,
  handler: async (req) => {
    if (req.method === 'GET') {
      return { messages: seedStatus };
    } else if (req.method === 'DELETE') {
      seedStatus.length = 0;
      return null;
    }

    const data: { message?: string } = req.json && (await req.json());

    if (data.message) seedStatus.push(data.message);

    return { messages: seedStatus };
  },
});
