import { signIn } from '@/auth/operations/signIn';
import { extractErrorMessage } from '@lactalink/utilities';
import { Arguments } from 'node_modules/payload/dist/auth/operations/login';
import { CollectionBeforeOperationHook } from 'payload';

export const supabaseSignIn: CollectionBeforeOperationHook = async (params) => {
  const { collection, operation, args, req } = params;

  if (operation !== 'login' || collection.slug !== 'users') return args;

  const {
    data: { email, password },
  } = args as Arguments<'users'>;

  await signIn(email, password).catch((err) => {
    req.payload.logger.error(extractErrorMessage(err));
  });

  return args;
};
