import { createAbortError } from '@/lib/utils/createError';
import { APIError, CollectionBeforeOperationHook } from 'payload';

export const abortGuard: CollectionBeforeOperationHook<'donations'> = async ({ args, req }) => {
  const { signal } = req;

  if (signal?.aborted) {
    throw createAbortError();
  }

  signal?.addEventListener(
    'abort',
    () => {
      if (signal.reason instanceof APIError) throw signal.reason;
      else throw createAbortError();
    },
    { once: true }
  );

  return args;
};
