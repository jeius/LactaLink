import { extractBearerToken } from '@/lib/utils/extractToken';
import { createClient } from '@/lib/utils/supabase/server';
import { User } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { AuthError } from '@supabase/supabase-js';
import { AuthStrategyFunction, AuthStrategyResult } from 'payload';

export const SupabaseStrategy: AuthStrategyFunction = async (params) => {
  const { payload, strategyName, isGraphQL, headers } = params;
  const collection = payload.collections['users'];
  const collectionSlug = 'users';

  payload.logger.info('Supabase auth strategy called');

  try {
    const supabase = await createClient();

    const token = extractBearerToken(headers);

    const {
      data: { user: sbUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      throw new AuthError(error.message, error.status, error.code);
    }

    if (!sbUser) {
      payload.logger.error('User not found from supabase.');
      return { user: null };
    }

    if (!sbUser.email) {
      const msg = 'Unable to create new user, no email provided.';
      payload.logger.error(msg);
      throw new AuthError(msg, 404, 'missing_email');
    }

    const baseData: Omit<User, 'createdAt' | 'sizes' | 'updatedAt'> = {
      id: sbUser.id,
      email: sbUser.email,
      emailConfirmedAt: sbUser.email_confirmed_at || null,
      phone: sbUser.phone || null,
      phoneConfirmedAt: sbUser.phone_confirmed_at || null,
      confirmedAt: sbUser.confirmed_at || null,
      lastSignInAt: sbUser.last_sign_in_at || null,
    };

    const { id, ...updateUser } = baseData;

    const userDoc = await payload
      .findByID({
        id: sbUser.id,
        collection: collectionSlug,
        depth: isGraphQL ? 0 : collection.config.auth.depth,
      })
      .then(
        async (user) =>
          await payload.update({
            id,
            user,
            collection: collectionSlug,
            data: updateUser,
          })
      )
      .catch(async () => {
        payload.logger.info('User not found, creating new user...');
        return await payload.create({
          collection: collectionSlug,
          data: { ...baseData, createdVia: 'OAUTH', password: crypto.randomUUID() },
        });
      })
      .catch(async () => {
        // This is to avoid race conditions when two users are created at the same time.
        // If the user already exists, we will just return the existing user.
        return await payload.findByID({
          id: sbUser.id,
          collection: collectionSlug,
          depth: isGraphQL ? 0 : collection.config.auth.depth,
        });
      });

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
