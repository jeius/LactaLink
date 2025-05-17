import { useFonts } from 'expo-font';

export const useFontsLoader = () =>
  useFonts({
    'Jakarta-Bold': require('../assets/fonts/Jakarta-Bold.ttf'),
    'Jakarta-ExtraBold': require('../assets/fonts/Jakarta-ExtraBold.ttf'),
    'Jakarta-ExtraLight': require('../assets/fonts/Jakarta-ExtraLight.ttf'),
    'Jakarta-Italic': require('../assets/fonts/Jakarta-Italic.ttf'),
    'Jakarta-Light': require('../assets/fonts/Jakarta-Light.ttf'),
    'Jakarta-Medium': require('../assets/fonts/Jakarta-Medium.ttf'),
    'Jakarta-Regular': require('../assets/fonts/Jakarta-Regular.ttf'),
    'Jakarta-SemiBold': require('../assets/fonts/Jakarta-SemiBold.ttf'),
  });
