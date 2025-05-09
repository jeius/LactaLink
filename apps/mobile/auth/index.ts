import { API_URL, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import {
  getAuth as GetAuth,
  signIn as SignIn,
  signOut as SignOut,
  signUp as SignUp,
} from '@lactalink/utilities';

const vercelToken = VERCEL_BYPASS_TOKEN;
const apiUrl = API_URL;

type Params = { email: string; password: string };

export async function signIn(params: Params) {
  return await SignIn({ ...params, supabase, apiUrl, vercelToken });
}

export async function signUp(params: Params) {
  return await SignUp({ ...params, supabase });
}

export async function signOut() {
  return await SignOut(supabase);
}

export async function getAuth() {
  return await GetAuth({ supabase, apiUrl, vercelToken });
}
