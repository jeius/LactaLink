import { getApiClient } from '@lactalink/api';
import { User } from '@lactalink/types';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { AuthError } from '@supabase/supabase-js';

export async function signInWithGoogle(): Promise<User> {
  try {
    const apiClient = getApiClient();
    await GoogleSignin.hasPlayServices();
    const res = await GoogleSignin.signIn();

    if (!isSuccessResponse(res)) {
      throw new Error('Could not authenticate with Google. Try again later!');
    }

    const { idToken } = res.data;

    if (!idToken) {
      throw new Error('No Google ID Token found');
    }

    return await apiClient.auth.signInWithIdToken({ token: idToken, provider: 'google' });
  } catch (error) {
    let message = 'An unknown error occured. Please try again later!';
    let code = 'google_sign_in_error';
    const status = 500;

    if (isErrorWithCode(error)) {
      code = error.code;
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
      throw error; // Re-throw AuthError to be handled by caller
    }

    throw new AuthError(message, status, code);
  }
}
