import { User } from '@lactalink/types';
import { CollectionAfterMeHook, getAccessResults, MeOperationResult } from 'payload';

export const appendPermissions: CollectionAfterMeHook<User> = async ({ req, response }) => {
  const permissions = await getAccessResults({ req });

  return { ...(response as MeOperationResult), permissions };
};
