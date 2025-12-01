import { CONVERSATION_ROLE } from '@lactalink/enums';
import { extractID } from '@lactalink/utilities/extractors';
import type { PayloadRequest, Where } from 'payload';

// Cache key for request-scoped memoization
const CACHE_KEY = 'conversation-ids-cache';

interface ConversationIdsCache {
  all?: string[];
  admin?: string[];
}

export async function getUserConversationIds(
  req: PayloadRequest,
  role?: keyof typeof CONVERSATION_ROLE
): Promise<string[]> {
  const userId = req.user?.id;
  if (!userId) return [];

  if (req.context.skipConversationIdFetch) {
    return [];
  }

  // Use request context to cache results
  if (!req.context[CACHE_KEY]) {
    req.context[CACHE_KEY] = {} as ConversationIdsCache;
  }

  const cache = req.context[CACHE_KEY] as ConversationIdsCache;
  const cacheKey = role === CONVERSATION_ROLE.ADMIN.value ? 'admin' : 'all';

  // Return cached result if available
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // Build query
  const where: Where = role
    ? {
        and: [{ participant: { equals: userId } }, { role: { equals: role } }],
      }
    : { participant: { equals: userId } };

  // Prevent redundant fetches in nested calls
  req.context.skipConversationIdFetch = true;

  // Fetch conversation IDs
  const { values } = await req.payload.findDistinct({
    collection: 'conversation-participants',
    where,
    limit: 0,
    depth: 0,
    req,
    field: 'conversation',
    sort: 'conversation',
  });

  const ids = values.map((p) => extractID(p.conversation));

  // Cache and return
  cache[cacheKey] = ids;
  req.context[CACHE_KEY] = cache;
  return ids;
}
