import { Theme } from '@lactalink/types';

declare module '@env' {
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const GOOGLE_IOS_CLIENT_ID: string;
  export const EXPO_PUBLIC_API_URL: string;
  export const EXPO_PUBLIC_SUPABASE_URL: string;
  export const EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  export const VERCEL_AUTOMATION_BYPASS_SECRET: string | undefined;
  export const ANDROID_MAPS_API_KEY: string;
  export const IOS_MAPS_API_KEY: string;
  export const EXPO_THEME: Theme | undefined;
}

declare module '*.svg' {
  import * as React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png' {
  const value: string;
  export default value;
}
