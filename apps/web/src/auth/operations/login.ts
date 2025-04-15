import { User } from '@/lib/types';
import { getRequestCollection, jwtSign } from '@/lib/utils';
import type { SanitizedPermissions } from 'payload';
import { getAccessResults, getFieldsToSign, PayloadRequest } from 'payload';

export type Result =
  | {
      exp: number;
      token: string;
      user: User;
      permissions: SanitizedPermissions;
    }
  | { user: null };

export const loginOperation = async (req: PayloadRequest): Promise<Result> => {
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
