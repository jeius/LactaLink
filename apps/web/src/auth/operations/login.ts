import { getRequestCollection, jwtSign } from '@/lib/utils';
import type { AuthResult, User } from '@lactalink/types';
import { getAccessResults, getFieldsToSign, PayloadRequest } from 'payload';

export const loginOperation = async (req: PayloadRequest): Promise<AuthResult> => {
  const collection = getRequestCollection(req);
  const user = req.user;

  if (!user) {
    return { user: null, message: 'Unable to authenticate user.' };
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

  const { collection: collectionSlug, ...restOfUser } = user;

  const permissions = await getAccessResults({ req });

  return {
    exp,
    token,
    permissions,
    collection: collectionSlug,
    user: { ...restOfUser } as User,
  };
};
