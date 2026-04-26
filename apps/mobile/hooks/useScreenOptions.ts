import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { getColor, getPrimaryColor } from '@/lib/colors';
import { StackScreenOptions, TabScreenOptions } from '@/lib/types';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    headerTitleStyle: { fontFamily: 'Jakarta-Bold', fontSize: 18 },
    headerTintColor: getPrimaryColor('0'),
    headerStyle: { backgroundColor: getPrimaryColor('500') },
    contentStyle: { backgroundColor: getColor('background', '50') },
  };
}

export function useScreenFormSheetOptions(): StackScreenOptions {
  const { themeColors } = useTheme();

  const inset = useSafeAreaInsets();
  const screen = useWindowDimensions();

  const allowedDetent = (screen.height - inset.top) / screen.height;

  return {
    presentation: 'formSheet',
    contentStyle: { backgroundColor: themeColors.background[0] },
    animation: 'slide_from_bottom',
    sheetElevation: 24,
    sheetCornerRadius: 32,
    sheetAllowedDetents: [allowedDetent],
  };
}

export function useTabScreenOptions(): TabScreenOptions {
  return {
    headerShown: false,
    headerShadowVisible: true,
    headerBackButtonDisplayMode: 'minimal',
    headerTitleStyle: { fontFamily: 'Jakarta-Bold', fontSize: 18 },
    headerTintColor: getPrimaryColor('0'),
    headerStyle: { backgroundColor: getPrimaryColor('500') },
    sceneStyle: { backgroundColor: getColor('background', '50') },
    tabBarStyle: { backgroundColor: getColor('background', '0') },
    tabBarInactiveTintColor: getColor('typography', '900'),
    tabBarActiveTintColor: getColor('primary', '500'),
  };
}
