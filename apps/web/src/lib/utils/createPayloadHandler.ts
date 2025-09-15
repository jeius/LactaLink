/**
 * Utility function to create a standardized Payload handler.
 *
 * This function wraps a custom handler with additional functionality, such as:
 * - Authorization checks for admin users.
 * - Logging of operation success or failure.
 * - Measuring and logging the elapsed time for the operation.
 * - Returning a standardized JSON response.
 */

import { ApiFetchResponse } from '@lactalink/types/api';
import { extractErrorMessage, extractErrorStatus } from '@lactalink/utilities/extractors';
import { status as HttpStatus } from 'http-status';
import { APIError, PayloadHandler, PayloadRequest } from 'payload';

/**
 * Options for configuring the Payload handler.
 */
interface HandlerOptions<T = unknown> {
  /**
   * Whether the handler requires the user to be an admin.
   *
   * @default false
   */
  requireAdmin?: boolean;

  /**
   * Whether the handler requires the user to be authenticated.
   *
   * @default true
   */
  requireAuth?: boolean;

  /**
   * The custom handler function to execute.
   * Receives the request object as its parameter.
   */
  handler: (req: PayloadRequest) => Promise<T>;

  /**
   * A custom success message to include in the response.
   * Can be a string or a function that returns a string or a Promise that resolves to a string.
   *
   * @default 'Operation completed successfully.'
   */
  successMessage?: string | ((req: PayloadRequest, data: T) => string | Promise<string>);
}

/**
 * Creates a standardized Payload handler.
 *
 * @param {HandlerOptions} options - The options for configuring the handler.
 * @returns {PayloadHandler} - A function that handles the request and returns a response.
 *
 * @description
 * This function wraps a custom handler with additional functionality:
 * - If `requireAuth` is `true`, it checks if the user is authenticated and throws an error if not.
 * - If `requireAdmin` is `true`, it checks if the user is an admin and throws an error if not.
 * - Executes the custom handler.
 * - Logs success or error messages and returns a standardized JSON response.
 * - Handles errors gracefully, including `APIError` instances.
 */
export function createPayloadHandler<T>({
  requireAdmin = false,
  requireAuth = true,
  handler,
  successMessage,
}: HandlerOptions<T>): PayloadHandler {
  return async (req) => {
    const { user, payload, t } = req;

    try {
      if (requireAuth && !user) {
        throw new APIError(t('error:unauthorized'), HttpStatus.UNAUTHORIZED, null, true);
      }

      // Check if the operation requires admin privileges and validate the user.
      if (requireAuth && user && requireAdmin && user.role !== 'ADMIN') {
        throw new APIError(t('error:unauthorizedAdmin'), HttpStatus.UNAUTHORIZED);
      }

      // Execute the custom handler and capture the result.
      const data = await handler(req);

      // Prepare the success response.
      const status = HttpStatus.OK;
      const message =
        typeof successMessage === 'string'
          ? successMessage
          : typeof successMessage === 'function'
            ? await successMessage(req, data)
            : 'Operation completed successfully.';

      // Log the success message and elapsed time.
      if (message) payload.logger.info(`${message}`);

      // Exclude data in the response if its null or undefined;
      if (data === null || data === undefined) {
        return Response.json({ message }, { status });
      }

      const res: ApiFetchResponse<T> = { message, data, status };

      // Return the success response.
      return Response.json(res, { status });
    } catch (error) {
      // Prepare the error response.
      const message = extractErrorMessage(error);
      const status: number = extractErrorStatus(error);
      const res: ApiFetchResponse<T> = { message, error, status };

      payload.logger.error(error, `API Error: ${message}`);

      // Return the error response.
      return Response.json(res, { status });
    }
  };
}
