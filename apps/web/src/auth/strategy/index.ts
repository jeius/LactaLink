import { users } from '@/lib/db/drizzle-schema';
import { extractToken } from '@/lib/utils/extractToken';
import { createClient } from '@/lib/utils/supabase/server';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { eq } from '@payloadcms/db-postgres/drizzle';
import { AuthError } from '@supabase/supabase-js';
import { AuthStrategyFunction, AuthStrategyResult } from 'payload';

export const SupabaseStrategy: AuthStrategyFunction = async (params) => {
  const { payload, strategyName, headers } = params;
  const collectionSlug = 'users';

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
      payload.logger.error('User not found from supabase.');
      return { user: null };
    }

    const [{ authId: __, ...userDoc }] = await payload.db.drizzle
      .select()
      .from(users)
      .where(eq(users.authId, sbUser.id))
      .limit(1);

    const user: AuthStrategyResult['user'] = {
      ...userDoc,
      collection: collectionSlug,
      _strategy: strategyName,
    };

    return { user };
  } catch (_) {
    payload.logger.error(extractErrorMessage(_));
    return { user: null };
  }
};
