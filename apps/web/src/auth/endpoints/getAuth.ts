import { status as httpStatus } from 'http-status';

import { meOperation } from '@/auth/operations/me';
import { getRequestCollection } from '@/lib/utils';
import type { PayloadHandler } from 'payload';
import { extractJWT, getAccessResults, headersWithCors } from 'payload';

export const getAuthHandler: PayloadHandler = async (req) => {
  const collection = getRequestCollection(req);
  const currentToken = extractJWT(req);

  const result = await meOperation(currentToken);
  const permissions = await getAccessResults({ req });

  if (collection.config.auth.removeTokenFromResponses) {
    delete result.token;
  }

  return Response.json(
    {
      ...result,
      permissions,
      message: req.t('authentication:authenticated'),
    },
    {
      headers: headersWithCors({
        headers: new Headers(),
        req,
      }),
      status: httpStatus.OK,
    }
  );
};
