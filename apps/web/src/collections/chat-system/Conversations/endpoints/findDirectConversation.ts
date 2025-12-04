import { findDirectConversation } from '@/lib/db/drizzle/queryBuilders/findDirectConversation';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { ValidationErrorNames } from '@lactalink/enums/error-names';
import {
  directConvoParticipantsSchema,
  FindDirectConversationParams,
} from '@lactalink/form-schemas/validators';
import { ValidationError } from '@lactalink/utilities/errors';
import status from 'http-status';
import { APIError, PayloadRequest } from 'payload';
import z from 'zod';

export const findDirectConversationHandler = createPayloadHandler({
  handler: async (req) => {
    try {
      return await handler(req);
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new APIError(err.message, err.statusCode, err, true);
      }
      throw err;
    }
  },
  successMessage: (_req, data) => {
    if (data) return 'Direct conversation found';
    return 'No direct conversation found between these participants';
  },
});

export default findDirectConversationHandler;

async function handler(req: PayloadRequest) {
  const { payload, query } = req;

  const params = parseQueryParam(query.participants);

  const conversationQuery = payload.db.drizzle
    .$with('findDirectConversation')
    .as(findDirectConversation(params));

  const conversation = await payload.db.drizzle
    .with(conversationQuery)
    .select({ id: conversationQuery.id })
    .from(conversationQuery)
    .limit(1)
    .then((results) => results[0] || null);

  if (!conversation) {
    return null;
  }

  const doc = await payload.findByID({
    collection: 'conversations',
    id: conversation.id,
    depth: 5,
  });

  return doc;
}

function parseQueryParam(input: unknown): FindDirectConversationParams {
  if (input === undefined || input === null) {
    throw new ValidationError('Invalid query parameter: Missing participants IDs', {
      name: ValidationErrorNames.REQUIRED_FIELD_MISSING,
      statusCode: status.BAD_REQUEST,
      statusText: 'Bad Request',
    });
  }

  if (!Array.isArray(input)) {
    throw new ValidationError('Invalid query parameter: Expecting an array of participant IDs', {
      name: ValidationErrorNames.INVALID_TYPE,
      statusCode: status.BAD_REQUEST,
      statusText: 'Bad Request',
    });
  }

  if (input.length !== 2) {
    throw new ValidationError('Invalid query parameter: Exactly two participant IDs are required', {
      name: ValidationErrorNames.ARRAY_LENGTH_MISMATCH,
      statusCode: status.BAD_REQUEST,
      statusText: 'Bad Request',
    });
  }

  const parsed = directConvoParticipantsSchema.safeParse(input);

  if (parsed.data) {
    return parsed.data;
  }

  const error = z.flattenError(parsed.error);
  let errMsg: string | undefined;

  if (error.formErrors.length) {
    errMsg = error.formErrors[0];
  } else {
    const firstError = error.fieldErrors[0]?.pop();
    const secondError = error.fieldErrors[1]?.pop();
    errMsg = firstError || secondError;
  }

  throw new ValidationError(errMsg || `Invalid search param 'options'.`, {
    name: ValidationErrorNames.INVALID_FORMAT,
    statusCode: status.UNPROCESSABLE_ENTITY,
    statusText: 'Unprocessable Entity',
  });
}
