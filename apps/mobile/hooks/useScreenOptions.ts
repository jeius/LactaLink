import { getColor, getPrimaryColor } from '@/lib/colors';
import { StackScreenOptions } from '@/lib/types';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

const IS_IOS = Platform.OS === 'ios';

interface UseScreenOptions {
  animationType?: 'slide' | 'fade' | 'default';
}

export function useScreenOptions(args?: UseScreenOptions): StackScreenOptions {
  const { animationType } = args || {};

  let animation: StackAnimationTypes;

  switch (animationType) {
    case 'slide':
      animation = IS_IOS ? 'ios_from_right' : 'slide_from_right';
      break;

    case 'fade':
      animation = 'fade';
      break;

    default:
      animation = 'default';
      break;
  }

  return {
    animation,
    headerShown: false,
    headerBackVisible: true,
    headerShadowVisible: true,
    headerBackButtonDisplayMode: 'minimal',
    headerTitleStyle: { fontFamily: 'Jakarta-Bold', fontSize: 16 },
    headerTintColor: getPrimaryColor('0'),
    headerStyle: { backgroundColor: getPrimaryColor('500') },
    contentStyle: { backgroundColor: getColor('background', '50') },
  };
}
