import { createClient } from '@/lib/utils/supabase/server';
import { AuthError } from '@supabase/supabase-js';
import { AuthStrategyFunction, AuthStrategyResult } from 'payload';

export const SupabaseStrategy: AuthStrategyFunction = async (params) => {
  const { payload, strategyName, isGraphQL, headers } = params;

  try {
    const supabase = await createClient();
    const collection = payload.collections['users'];

    let token = headers.get('Authorization') || undefined;

    if (token?.startsWith('Bearer ')) {
      token = token.replace('Bearer ', '').trim();
    }

    const {
      data: { user: sbUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      throw new AuthError(error.message, error.status, error.code);
    }

    if (!sbUser) {
      return { user: null };
    }

    const userDoc = await payload.findByID({
      id: sbUser.id,
      collection: collection.config.slug,
      depth: isGraphQL ? 0 : collection.config.auth.depth,
    });

    if (!userDoc) {
      return { user: null };
    }

    const user: AuthStrategyResult['user'] = {
      ...userDoc,
      collection: collection.config.slug,
      _strategy: strategyName,
    };

    return { user };
  } catch (_) {
    // payload.logger.error(_, extractErrorMessage(_));
    return { user: null };
  }
};
