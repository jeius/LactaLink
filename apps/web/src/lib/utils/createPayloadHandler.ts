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
import { ValidationError } from '@lactalink/utilities/errors';
import {
  extractErrorMessage,
  extractErrorStatus,
  extractErrorStatusText,
} from '@lactalink/utilities/extractors';
import { status as HttpStatus } from 'http-status';
import isString from 'lodash/isString';
import { addDataAndFileToRequest, APIError, PayloadHandler, PayloadRequest } from 'payload';
import { abortableAPIHandler } from './abortableHandler';
import { createTimeoutError } from './createError';
import { isAdmin } from './isAdmin';

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
   * Maximum time (in milliseconds) to allow for the handler to execute before timing out.
   * If the handler takes longer than this time, it will be aborted and an error response
   * will be returned.
   *
   * @default 30000 (30 seconds)
   */
  maxDuration?: number;

  /**
   * The custom handler function to execute.
   * @param req - The Payload request object.
   * @param signal - An `AbortSignal` that can be used to handle request cancellation
   * and timeouts.
   *
   * @returns A Promise that resolves to the data to be returned in the response.
   */
  handler: (req: PayloadRequest, signal: AbortSignal) => Promise<T>;

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
 * @param options - The options for configuring the handler.
 * @returns A function that handles the request and returns a `JSON` response.
 *
 * @description
 * This function wraps a custom handler with additional functionality:
 * - If `requireAuth` is `true`, it checks if the user is authenticated and throws an error if not.
 * - If `requireAdmin` is `true`, it checks if the user is an admin and throws an error if not.
 * - Executes the custom handler.
 * - Logs success or error messages and returns a standardized `JSON` response.
 * - Handles errors gracefully, including `APIError` instances.
 */
export function createPayloadHandler<T>({
  requireAdmin = false,
  requireAuth = true,
  handler,
  maxDuration = 30 * 1000,
  successMessage,
}: HandlerOptions<T>): PayloadHandler {
  return async (req) => {
    const { user, payload, t } = req;

    // Record the start time for duration logging
    const startTime = performance.now();

    // Create an internal abort controller to trigger the timeout
    const abortController = new AbortController();

    // Combine the request signal with the abort controller signal to allow for cancellation
    const signal = AbortSignal.any(
      [req.signal, abortController.signal].filter(Boolean) as AbortSignal[]
    );

    // Timeout to abort the request if it takes too long
    const timeoutId = setTimeout(() => {
      abortController.abort(createTimeoutError());
    }, maxDuration);

    try {
      if ((requireAuth || requireAdmin) && !user) {
        const status = HttpStatus.UNAUTHORIZED;
        throw new APIError(
          t('error:unauthorized'),
          status,
          { message: HttpStatus[`${status}_MESSAGE`] },
          true
        );
      }

      if (requireAdmin && !isAdmin(user)) {
        const status = HttpStatus.FORBIDDEN;
        throw new APIError(
          t('error:unauthorizedAdmin'),
          status,
          { message: HttpStatus[`${status}_MESSAGE`] },
          true
        );
      }

      // Since data and files are not automatically parsed by Payload for custom endpoints,
      // we need to manually add them to the request object
      await addDataAndFileToRequest(req);

      const data = await abortableAPIHandler(() => handler(req, signal), { signal });

      // Prepare the success response.
      const status = HttpStatus.OK;
      const statusText = HttpStatus[status];
      const init: ResponseInit = { status, statusText };

      const message = successMessage
        ? isString(successMessage)
          ? successMessage
          : await successMessage(req, data)
        : 'Operation completed successfully.';

      const result: ApiFetchResponse<T> = { message, data };
      return Response.json(result, init);
    } catch (error) {
      // Prepare the error response.
      let message = extractErrorMessage(error);
      let status = extractErrorStatus(error);
      let statusText = extractErrorStatusText(error);

      if (error instanceof ValidationError) {
        status = error.statusCode || HttpStatus.BAD_REQUEST;
        message = `[Validation Error]: ${error.message}`;
        statusText = error.statusText || HttpStatus[status as 500] || 'Bad Request';
      }

      if (error instanceof APIError) {
        status = error.status;
        message = `[API Error]: ${error.message}`;
        statusText = HttpStatus[status as 500] || 'Internal Server Error';
      }

      const res: ApiFetchResponse<T> = { message, error };

      payload.logger.error(error, message);

      // Return the error response.
      return Response.json(res, { status, statusText });
    } finally {
      clearTimeout(timeoutId);
      const elapsed = (performance.now() - startTime).toFixed(2);
      payload.logger.info(`[Request Duration]: ${elapsed}ms`);
    }
  };
}
