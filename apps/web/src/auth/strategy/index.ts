import { extractToken } from '@/lib/utils/extractToken';
import { createClient } from '@/lib/utils/supabase/server';
import { users } from '@db/drizzle/schema';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { eq } from '@payloadcms/db-postgres/drizzle';
import { AuthError, SupabaseClient, User } from '@supabase/supabase-js';
import status from 'http-status';
import { AuthStrategyFunction, AuthStrategyResult, type CollectionSlug } from 'payload';

export const SupabaseStrategy: AuthStrategyFunction = async (params) => {
  const { payload, strategyName, headers } = params;
  const collectionSlug: CollectionSlug = 'users';
  const collection = payload.collections[collectionSlug];

  payload.logger.info('Authenticating...');

  const supabase = await createClient();

  try {
    const sbUser = await getSupabaseAuthUser(supabase, headers);

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

async function getSupabaseAuthUser(supabase: SupabaseClient, headers: Headers) {
  let user: User | null = null;
  let error: AuthError | null = null;

  const postmanToken = headers.get('Postman-Token');

  if (!postmanToken) {
    const token = extractToken(headers);
    const { data, error: authError } = await supabase.auth.getUser(token);
    error = authError;
    user = data.user;
  } else {
    const credentials = extractToken(headers, 'Basic');

    if (!credentials) {
      throw new AuthError(
        'Missing Basic Auth credentials',
        status.NOT_FOUND,
        'missing_credentials'
      );
    }

    const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf8');

    const [username, password] = decodedCredentials.split(':');

    if (!username || !password) {
      throw new AuthError(
        'Invalid Basic Auth credentials',
        status.NOT_ACCEPTABLE,
        'invalid_credentials'
      );
    }

    const { error: authError, data } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });

    error = authError;
    user = data.user;
  }

  if (error) {
    throw new AuthError(error.message, error.status, error.code);
  }

  return user;
}
