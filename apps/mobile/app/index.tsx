// eslint-disable-next-line import/no-unresolved
import { EXPO_PUBLIC_API_URL } from '@env';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import type { SignInResult } from '@lactalink/types';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { View } from 'react-native';

const API_URL = EXPO_PUBLIC_API_URL;

export default function App() {
  const [token, setToken] = useState('');
  async function handleGoogleSignIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const res = await GoogleSignin.signIn();
      if (isSuccessResponse(res)) {
        const { idToken } = res.data;

        // You can now use the idToken to authenticate with your backend server
        const authResult = await fetch(`${API_URL}/api/users/login/google`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (authResult.ok) {
          const authData = (await authResult.json()) as SignInResult;

          if ('token' in authData) setToken(authData.token);
        } else {
          const errorData = await authResult.json();
          console.log('Error authenticating: ', errorData);
        }
      } else {
        console.log('Error signing in: ', res);
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play services not available or outdated.');
            return;
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('User cancelled the sign-in flow.');
            return;
          case statusCodes.IN_PROGRESS:
            console.log('Sign-in is in progress already.');
            return;
          case statusCodes.SIGN_IN_REQUIRED:
            console.log('Sign-in is required.');
            return;
          default:
            return;
        }
      }
      console.log('Unknown error: ', error);
    }
  }

  async function handleVerify() {
    console.log('JWT', token);
    try {
      const authResult = await fetch(`${API_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
      });

      const data = authResult.json();
      console.log('Verified Data: ', data);
    } catch (error) {
      console.log('Verification Failed', error);
    }
  }

  return (
    <View className="flex-1 items-center justify-center gap-y-2">
      <View className="items-center">
        <Heading bold={true} size="2xl">
          Sign in with Google
        </Heading>
      </View>
      <Button variant="solid" size="lg" onPress={handleGoogleSignIn}>
        <Text className="text-primary-0">Sign in</Text>
      </Button>
      <Button variant="outline" size="lg" onPress={handleVerify}>
        <Text className="text-foreground-500">Verify Access</Text>
      </Button>
    </View>
  );
}
