import { extractToken } from '@/lib/utils/extractToken';
import { createClient } from '@/lib/utils/supabase/server';
import { User } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { AuthError } from '@supabase/supabase-js';
import { AuthStrategyFunction, AuthStrategyResult } from 'payload';

export const SupabaseStrategy: AuthStrategyFunction = async (params) => {
  const { payload, strategyName, isGraphQL, headers } = params;
  const collection = payload.collections['users'];
  const collectionSlug = 'users';

  payload.logger.info('Authenticating...');

  try {
    const supabase = await createClient();

    const token = extractToken(headers);

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
      const msg = 'User has no email, unable to authenticate.';
      payload.logger.error(msg);
      throw new AuthError(msg, 404, 'missing_email');
    }

    const baseData: Omit<User, 'createdAt' | 'sizes' | 'updatedAt' | 'id'> = {
      authId: sbUser.id,
      email: sbUser.email,
      emailConfirmedAt: sbUser.email_confirmed_at || null,
      phone: sbUser.phone || null,
      phoneConfirmedAt: sbUser.phone_confirmed_at || null,
      confirmedAt: sbUser.confirmed_at || null,
      lastSignInAt: sbUser.last_sign_in_at || null,
    };

    const userDoc = await payload
      .find({
        collection: collectionSlug,
        depth: isGraphQL ? 0 : collection.config.auth.depth,
        pagination: false,
        limit: 1,
        where: {
          or: [{ authId: { equals: sbUser.id } }, { email: { equals: sbUser.email } }],
        },
      })
      .then(async ({ docs }) => {
        if (!docs.length) throw new Error('User not found.');

        const user = docs[0];
        return await payload.update({
          id: user.id,
          user,
          collection: collectionSlug,
          data: baseData,
        });
      })
      .catch(async () => {
        payload.logger.info('User not found, creating new user...');

        return await payload.create({
          collection: collectionSlug,
          data: { ...baseData, createdVia: 'OAUTH' },
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
