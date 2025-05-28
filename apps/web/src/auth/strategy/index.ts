import { users } from '@/lib/db/drizzle-schema';
import { extractToken } from '@/lib/utils/extractToken';
import { createClient } from '@/lib/utils/supabase/server';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { eq } from '@payloadcms/db-postgres/drizzle';
import { AuthError } from '@supabase/supabase-js';
import { AuthStrategyFunction, AuthStrategyResult, type CollectionSlug } from 'payload';

export const SupabaseStrategy: AuthStrategyFunction = async (params) => {
  const { payload, strategyName, headers } = params;
  const collectionSlug: CollectionSlug = 'users';
  const collection = payload.collections[collectionSlug];

  payload.logger.info('Authenticating...');

  try {
    const supabase = await createClient();

    const token = extractToken(headers);

    const {
      data: { user: sbUser },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError) {
      throw new AuthError(authError.message, authError.status, authError.code);
    }

    if (!sbUser) {
      payload.logger.warn('User not found from supabase.');
      return { user: null };
    }

    const [authenticatedUser] = await payload.db.drizzle
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authId, sbUser.id))
      .limit(1);

    if (!authenticatedUser) {
      payload.logger.warn('User not found in the database.');
      return { user: null };
    }

    const userDoc = await payload.findByID({
      id: authenticatedUser.id,
      collection: collectionSlug,
      depth: collection.config.auth.depth,
    });

    const user: AuthStrategyResult['user'] = {
      ...userDoc,
      collection: collectionSlug,
      _strategy: strategyName,
    };

    return { user };
  } catch (_) {
    payload.logger.warn(extractErrorMessage(_));
    return { user: null };
  }
};
