import { signUp } from '@/auth/operations/signUp';
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

  data.id = user.id;
  data.email = user.email;
  data.password = user.password;

  return data;
};
