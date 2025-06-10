'use server';

import { getServerApi } from '@/lib/api/getServerApi';
import { getServerSideURL } from '@/lib/utils/getURL';
import { SignInSchema, SignUpSchema, User, VerifyOtp } from '@lactalink/types';
import { extractAuthErrorCode, extractErrorMessage } from '@lactalink/utilities';
import { ResendParams, VerifyOtpParams } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export const signIn = async (credentials: SignInSchema) => {
  const apiClient = await getServerApi();
  const email = credentials.email;
  try {
    const user = await apiClient.auth.signIn(credentials);
    return { success: true, user };
  } catch (error) {
    const code = extractAuthErrorCode(error);

    if (code === 'email_not_confirmed') {
      await apiClient.auth.sendVerification({ email, type: 'signup' });
      return { success: false, needsVerification: true };
    }

    throw error;
  }
};

export const signUp = async (credentials: SignUpSchema, role: User['role']) => {
  const apiClient = await getServerApi();

  if (role === 'ADMIN') {
    return await apiClient.auth.createAdminUser(credentials);
  }
  return await apiClient.auth.signUp(credentials);
};

export const signOut = async () => {
  try {
    const apiClient = await getServerApi();
    await apiClient.auth.signOut();
  } catch (error) {
    const msg = extractErrorMessage(error);
    if (msg.toLowerCase().includes('session missing')) {
      // This is a common error when the session is already cleared or expired.
      return;
    }
    console.warn('Error during sign out:', error);
  }
};

export const getMeUser = async () => {
  const apiClient = await getServerApi();
  return await apiClient.auth.getMeUser();
};

export const getSession = async () => {
  const apiClient = await getServerApi();
  return await apiClient.auth.getSession();
};

export async function googleSignIn() {
  const apiClient = await getServerApi();
  const { url } = await apiClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getServerSideURL()}/auth/callback`,
    },
  });

  redirect(url);
}

export const sendOtp = async (params: VerifyOtp) => {
  const apiClient = await getServerApi();
  const type = params.type;
  if (type === 'recovery') {
    await apiClient.auth.resetPasswordForEmail(params.email, params.options);
  } else {
    await apiClient.auth.sendVerification(params as ResendParams);
  }
  return 'email' in params ? params.email : params.phone;
};

export const verifyOtp = async (params: VerifyOtpParams) => {
  const apiClient = await getServerApi();
  return await apiClient.auth.verifyOTP(params);
};
