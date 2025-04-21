import { status as HttpStatus } from 'http-status';
import { APIError, PayloadHandler } from 'payload';

type HandlerOptions = {
  requireAdmin?: boolean;
  handler: (req: Parameters<PayloadHandler>[0]) => Promise<unknown>;
  successMessage?: string;
};

export function createPayloadHandler({
  requireAdmin = false,
  handler,
  successMessage,
}: HandlerOptions): PayloadHandler {
  return async (req) => {
    const { user, t, payload } = req;
    const startTime = Date.now();

    try {
      if (requireAdmin && (!user || user.collection !== 'admins')) {
        throw new APIError(t('error:unauthorized'), HttpStatus.UNAUTHORIZED);
      }

      const data = await handler(req);

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      const message = successMessage || 'Operation successful.';
      const status = HttpStatus.OK;

      payload.logger.info(message);
      payload.logger.info(`Elapsed time: ${duration} seconds`);

      return Response.json({ message, data }, { status });
    } catch (error) {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      let message = 'Unknown error occurred.';
      let status: number = HttpStatus.INTERNAL_SERVER_ERROR;

      if (error instanceof APIError) {
        message = error.message;
        status = error.status;
      }

      payload.logger.error(error, message);
      payload.logger.error(`Elapsed time: ${duration} seconds`);

      return Response.json({ message, error }, { status });
    }
  };
}
