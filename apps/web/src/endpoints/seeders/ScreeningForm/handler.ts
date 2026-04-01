import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { PayloadRequest } from 'payload';

export default createPayloadHandler({
  requireAdmin: true,
  handler: seedScreeningFormHandler,
});

async function seedScreeningFormHandler(req: PayloadRequest, signal: AbortSignal) {
  return null;
}
