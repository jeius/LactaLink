import { createClient } from '@/lib/utils/supabase/server';
import { extractErrorMessage } from '@lactalink/utilities';
import { AuthStrategyFunction, AuthStrategyResult } from 'payload';

export const SupabaseStrategy: AuthStrategyFunction = async (params) => {
  const { payload, strategyName, isGraphQL } = params;

  try {
    const supabase = await createClient();
    const collection = payload.collections['users'];

    const {
      data: { user: sbUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !sbUser) {
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
  } catch (err) {
    payload.logger.error(err, extractErrorMessage(err));
    return { user: null };
  }
};
