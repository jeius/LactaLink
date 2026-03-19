import { cacheStore, hookLogger, isHookRun, markHookRun } from '@lactalink/agents/payload';
import { User } from '@lactalink/types/payload-generated-types';
import { CollectionAfterMeHook, MeOperationResult } from 'payload';

export const afterMe: CollectionAfterMeHook<User> = async ({ req, collection, response }) => {
  if (!req.user) return response;

  const res = response as MeOperationResult;

  const contextID = `afterMe-${req.user.id}`;
  const [getCachedUser, setUserCache] = cacheStore<User | null>(req, contextID);

  if (isHookRun(req, contextID)) {
    const cachedUser = getCachedUser();
    if (!cachedUser) return res;
    return { ...res, user: cachedUser };
  }

  markHookRun(req, contextID);

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

  setUserCache(updatedUser);
  return { ...res, user: updatedUser };
};
