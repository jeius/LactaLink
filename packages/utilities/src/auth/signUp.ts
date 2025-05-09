import { SignUpParams } from '@lactalink/types';

export async function signUp({ email, password, supabase }: SignUpParams) {
  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.log('Signup Error Code:', error.code);
    return { user: null, error, message: error.message };
  }

  return { user: user, error, message: '🎉 Account created successfully.' };
}
