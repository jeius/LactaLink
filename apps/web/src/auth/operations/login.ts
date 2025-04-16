import { User } from '@/lib/types';
import { getRequestCollection, jwtSign } from '@/lib/utils';
import type { AuthResult } from '@lactalink/types';
import { getAccessResults, getFieldsToSign, PayloadRequest } from 'payload';

export const loginOperation = async (req: PayloadRequest): Promise<AuthResult> => {
  const collection = getRequestCollection(req);
  const user = req.user;

  if (!user) {
    return { user: null };
  }
  const fieldsToSign = getFieldsToSign({
    collectionConfig: collection.config,
    email: user.email,
    user,
  });

  const { exp, token } = await jwtSign({
    fieldsToSign,
    secret: req.payload.secret,
    tokenExpiration: collection.config.auth.tokenExpiration,
  });

  const { collection: _, ...restOfUser } = user;

  const permissions = await getAccessResults({ req });

  return { user: restOfUser as User, exp, token, permissions };
};
