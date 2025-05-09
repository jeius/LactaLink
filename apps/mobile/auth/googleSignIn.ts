import { API_URL, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { AuthResult } from '@lactalink/types';
import { getMeUser } from '@lactalink/utilities';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { AuthError } from '@supabase/supabase-js';

export async function googleSignIn(): Promise<AuthResult> {
  try {
    await GoogleSignin.hasPlayServices();
    const res = await GoogleSignin.signIn();

    if (!isSuccessResponse(res)) {
      throw new AuthError('Could not authenticate with Google. Try again later!');
    }

    const { idToken } = res.data;

    if (!idToken) {
      throw new AuthError('No Google ID Token found');
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithIdToken({ token: idToken, provider: 'google' });

    if (error) {
      throw error;
    }

    if (!session) {
      throw new AuthError('No session found');
    }

    return await getMeUser(session.access_token, API_URL, VERCEL_BYPASS_TOKEN);
  } catch (error) {
    let message: string = 'An unknown error occured. Please try again later!';

    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          message = 'Play services not available or outdated.';
          console.log(message);
          break;
        case statusCodes.SIGN_IN_CANCELLED:
          message = 'User cancelled the sign-in flow.';
          console.log(message);
          break;
        case statusCodes.IN_PROGRESS:
          message = 'Sign-in is in progress already.';
          console.log(message);
          break;
        case statusCodes.SIGN_IN_REQUIRED:
          message = 'Sign-in is required.';
          console.log(message);
          break;
        default:
          message = 'Unknown error occurred.';
          break;
      }
    } else if (error instanceof Error) {
      message = error.message;
    } else if (error instanceof AuthError) {
      return { error };
    }

    return { error: new AuthError(message) };
  }
}
