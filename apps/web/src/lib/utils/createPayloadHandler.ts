/**
 * Utility function to create a standardized Payload handler.
 *
 * This function wraps a custom handler with additional functionality, such as:
 * - Authorization checks for admin users.
 * - Logging of operation success or failure.
 * - Measuring and logging the elapsed time for the operation.
 * - Returning a standardized JSON response.
 */

import { extractErrorMessage, extractErrorStatus } from '@lactalink/utilities';
import { status as HttpStatus } from 'http-status';
import { APIError, PayloadHandler, PayloadRequest } from 'payload';

/**
 * Options for configuring the Payload handler.
 */
type HandlerOptions = {
  /**
   * Whether the handler requires the user to be an admin.
   *
   * @default false
   */
  requireAdmin?: boolean;

  /**
   * The custom handler function to execute.
   * Receives the request object as its parameter.
   */
  handler: (req: PayloadRequest) => Promise<unknown>;

  /**
   * A custom success message to include in the response.
   * Can be a string or a function that returns a string or a Promise that resolves to a string.
   *
   * @default 'Operation completed successfully.'
   */
  successMessage?: string | ((req: PayloadRequest) => string | Promise<string>);
};

/**
 * Creates a standardized Payload handler.
 *
 * @param {HandlerOptions} options - The options for configuring the handler.
 * @returns {PayloadHandler} - A function that handles the request and returns a response.
 *
 * @description
 * This function wraps a custom handler with additional functionality:
 * - If `requireAdmin` is `true`, it checks if the user is an admin and throws an error if not.
 * - Executes the custom handler and logs the elapsed time for the operation.
 * - Logs success or error messages and returns a standardized JSON response.
 * - Handles errors gracefully, including `APIError` instances.
 */
export function createPayloadHandler({
  requireAdmin = false,
  handler,
  successMessage,
}: HandlerOptions): PayloadHandler {
  return async (req) => {
    const { user, payload } = req;
    const startTime = Date.now();

    try {
      if (!user) {
        throw new APIError(
          'Unauthorized: User not authenticated.',
          HttpStatus.UNAUTHORIZED,
          null,
          true
        );
      }

      // Check if the operation requires admin privileges and validate the user.
      if (requireAdmin && user.role !== 'ADMIN') {
        throw new APIError('Unauthorized: Only admin users allowed.', HttpStatus.UNAUTHORIZED);
      }

      // Execute the custom handler and capture the result.
      const data = await handler(req);

      // Calculate the elapsed time for the operation.
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      // Prepare the success response.
      const status = HttpStatus.OK;
      const message =
        typeof successMessage === 'string'
          ? successMessage
          : typeof successMessage === 'function'
            ? await successMessage(req)
            : 'Operation completed successfully.';

      // Log the success message and elapsed time.
      if (message) payload.logger.info(`> ${message}`);
      payload.logger.info(`>>> API Duration: ${duration} seconds`);

      // Exclude data in the response if its null or undefined;
      if (data === null || data === undefined) {
        return Response.json({ message }, { status });
      }

      // Return the success response.
      return Response.json({ message, data }, { status });
    } catch (error) {
      // Calculate the elapsed time for the operation.
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      // Prepare the error response.
      let message = extractErrorMessage(error);
      let status: number = extractErrorStatus(error);

      // If the error is an instance of APIError, use its message and status.
      if (error instanceof APIError) {
        message = error.message;
        status = error.status;
      }

      // Log the error message and elapsed time.
      payload.logger.error(error, `> ${message}`);
      payload.logger.error(`>>> API Duration: ${duration} seconds`);

      // Return the error response.
      return Response.json({ message, error }, { status });
    }
  };
}
