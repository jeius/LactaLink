'use client';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '@/lib/constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useEffect } from 'react';

export const useGoogleSignInConfig = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID, // from Google Cloud Console
      iosClientId: GOOGLE_IOS_CLIENT_ID,
    });
  }, []);
};
