import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { extractErrorMessage } from '@lactalink/utilities';
import status from 'http-status';
import { APIError } from 'payload';
import { seedNotificationSystem } from './seeder';

export const seedNotificationsHandler = createPayloadHandler({
  requireAdmin: true,
  handler: async (req) => {
    try {
      await seedNotificationSystem(req.payload);
      return { message: 'Notification system seeded successfully' };
    } catch (error) {
      throw new APIError(
        extractErrorMessage(error),
        status.EXPECTATION_FAILED,
        error as Error,
        true
      );
    }
  },
});
