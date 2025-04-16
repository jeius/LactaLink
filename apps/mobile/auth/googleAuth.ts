import { API_URL, MMKV_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { AuthResult } from '@lactalink/types';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export async function GoogleAuth(): Promise<AuthResult> {
  try {
    await GoogleSignin.hasPlayServices();
    const res = await GoogleSignin.signIn();

    if (isSuccessResponse(res)) {
      const { idToken } = res.data;
      const authResponse = await fetch(`${API_URL}/api/users/auth/google`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(errorData);
      }

      const authResult = (await authResponse.json()) as AuthResult;

      if (authResult.token) {
        Storage.set(MMKV_KEYS.AUTH_TOKEN, authResult.token);
      }

      return authResult;
    }
    return { user: null, message: 'Could not authenticate with Google. Try again later!' };
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
