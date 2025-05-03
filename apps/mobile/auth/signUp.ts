import { supabase } from '@/lib/supabase';

type SignUpParams = {
  email: string;
  password: string;
};
export async function signUp({ email, password }: SignUpParams) {
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { user: null, message: error.message };
  }

  if (!user) {
    return { user: null, message: 'Failed to create account.' };
  }

  return { user, message: '🎉 Account created successfully.' };
}
