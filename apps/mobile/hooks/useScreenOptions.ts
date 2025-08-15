import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { StackScreenOptions } from '@/lib/types';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

const IS_IOS = Platform.OS === 'ios';

interface UseScreenOptions {
  animationType?: 'slide' | 'fade' | 'default';
}

export function useScreenOptions(args?: UseScreenOptions): StackScreenOptions {
  const { themeColors } = useTheme();
  const headerBgColor = themeColors.primary[500];
  const headerTintColor = themeColors.primary[0];
  const bgColor = themeColors.background[50];

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
    headerShown: false,
    headerBackVisible: false,
    headerTitleStyle: {
      fontFamily: 'Jakarta-SemiBold',
      fontSize: 14,
    },
    headerStyle: { backgroundColor: headerBgColor?.toString() },
    headerTintColor: headerTintColor?.toString(),
    contentStyle: { backgroundColor: bgColor },
    headerShadowVisible: true,
    animation,
  };
}
