import { signUpWithSupabase as signUp } from '@/auth/operations/signUp';
import { User } from '@lactalink/types';
import { CollectionBeforeChangeHook, ValidationError } from 'payload';

export const supabaseSignUp: CollectionBeforeChangeHook<User> = async (args) => {
  const { collection, data, operation, req } = args;

  if (operation !== 'create' || collection.slug !== 'users') return data;

  const { email, password } = data;

  if (!email) {
    throw new ValidationError({
      collection: collection.slug,
      errors: [{ message: 'Email is required to create a user.', path: 'email' }],
      req,
      id: data.id,
    });
  }

  if (!password) {
    throw new ValidationError({
      collection: collection.slug,
      errors: [{ message: 'Password is required to create a user.', path: 'password' }],
      req,
      id: data.id,
    });
  }

  const user = await signUp(email, password);

  // If identities are present, it means the user is created successfully
  // and we can set the user id in the data object to be saved in the database.
  // Otherwise, we can assume that the user is already created and we can skip this step.
  // This is a workaround to avoid creating duplicate users in the database.
  if (user.identities?.length) {
    data.id = user.id;
  }

  return data;
};
