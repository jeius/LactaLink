import { User } from '@lactalink/types/payload-generated-types';
import { CollectionAfterMeHook, MeOperationResult } from 'payload';

export const afterMe: CollectionAfterMeHook<User> = async ({ req, response }) => {
  if (!req.user) return response;

  const now = new Date().toISOString();
  await req.payload.update({ collection: 'users', id: req.user.id, data: { onlineAt: now } });

  const res = response as MeOperationResult;

  return { ...res, user: { ...res.user, onlineAt: now } } as MeOperationResult;
};
