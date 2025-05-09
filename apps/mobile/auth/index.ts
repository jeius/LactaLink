import { API_URL, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import {
  getAuth as GetAuth,
  signIn as SignIn,
  signOut as SignOut,
  signUp as SignUp,
} from '@lactalink/utilities';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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
  if (GoogleSignin.hasPreviousSignIn()) {
    GoogleSignin.signOut();
  }
  return await SignOut(supabase);
}

export async function getAuth() {
  return await GetAuth({ supabase, apiUrl, vercelToken });
}
