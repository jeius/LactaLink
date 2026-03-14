import { hookLogger, isHookRun, markHookRun } from '@lactalink/agents/payload';
import { User } from '@lactalink/types/payload-generated-types';
import { CollectionAfterMeHook, MeOperationResult } from 'payload';

const hookName = 'skipUpdateOnlineAt';

export const afterMe: CollectionAfterMeHook<User> = async ({ req, collection, response }) => {
  if (!req.user) return response;

  if (isHookRun(req, hookName)) return response;
  markHookRun(req, hookName);

  const logger = hookLogger(req, collection.slug, 'afterMe');
  logger.info(`Getting full user document for authenticated user..`);

  const now = new Date().toISOString();
  const updatedUser = await req.payload.update({
    collection: 'users',
    id: req.user.id,
    data: { onlineAt: now },
    depth: 3,
    req,
  });

  const res = response as MeOperationResult;

  return { ...res, user: updatedUser };
};
