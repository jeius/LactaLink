import {
  getHookContext,
  hookLogger,
  isHookRun,
  markHookRun,
  setHookContext,
} from '@lactalink/agents/payload';
import { User } from '@lactalink/types/payload-generated-types';
import { CollectionAfterMeHook, MeOperationResult } from 'payload';

const hookName = 'skipUpdateOnlineAt';
const logCounterHookName = 'afterMelogCounter';

export const afterMe: CollectionAfterMeHook<User> = async ({ req, response }) => {
  if (!req.user) return response;

  if (isHookRun(req, hookName)) return response;
  markHookRun(req, hookName);

  const logCounter = getHookContext<number>(req, logCounterHookName) ?? 0;

  // Only log once per request
  if (logCounter < 1) {
    const logger = hookLogger(req, 'users', 'afterMe');
    logger.info(`Getting full user document for authenticated user..`);
    setHookContext(req, logCounterHookName, logCounter + 1);
  }

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
