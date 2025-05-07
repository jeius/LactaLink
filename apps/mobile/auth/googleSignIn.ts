import { getMeUser } from '@/lib/api/meUser';
import { supabase } from '@/lib/supabase';
import { AuthResult } from '@lactalink/types';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export async function googleSignIn(): Promise<AuthResult> {
  try {
    await GoogleSignin.hasPlayServices();
    const res = await GoogleSignin.signIn();

    if (!isSuccessResponse(res)) {
      return { user: null, message: 'Could not authenticate with Google. Try again later!' };
    }

    const { idToken } = res.data;

    if (!idToken) {
      return { user: null, message: 'No Google ID Token found' };
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithIdToken({ token: idToken, provider: 'google' });

    if (error) {
      return { user: null, message: error.message };
    }

    if (!session) {
      return { user: null, message: 'No session found' };
    }

    return await getMeUser(session.access_token);
  } catch (error) {
    if (isErrorWithCode(error)) {
      let message: string;
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

      return { message, user: null };
    }

    if (error instanceof Error) {
      return { user: null, message: error.message };
    }

    return { user: null, message: 'An unknown error occured. Please try again later!' };
  }
}
