import { getColor } from '@/lib/colors';
import { Insets } from 'react-native';
import {
  Extrapolation,
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

const IMAGE_HEIGHT = 240;
const MAX_SCROLL = 260;
const ACCENT_COLOR = getColor('primary', '100');

interface BaseOptions {
  insets?: Insets;
  imageHeight?: number;
  maxScroll?: number;
  accentColor?: string;
}

export function useParallaxAnimationStyles(
  scrollY: SharedValue<number>,
  {
    insets,
    imageHeight = IMAGE_HEIGHT,
    maxScroll = MAX_SCROLL,
    accentColor = ACCENT_COLOR,
  }: BaseOptions
) {
  const scrollAnimatedStyles = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, maxScroll],
      [0, -imageHeight],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }] };
  });

  const headerViewAnimatedStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [maxScroll / 3, maxScroll],
      ['transparent', accentColor]
    );
    const paddingTop = interpolate(
      scrollY.value,
      [maxScroll / 2, maxScroll],
      [12, (insets?.top || 0) + 12],
      Extrapolation.CLAMP
    );
    return { backgroundColor, paddingTop };
  });

  const titleAnimatedStyles = (fadeIn: boolean) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => {
      const outputRange = fadeIn ? [0, 1] : [1, 0];
      const opacity = interpolate(scrollY.value, [0, maxScroll * 0.75], outputRange);
      return { opacity, pointerEvents: opacity === 0 ? 'none' : 'auto' };
    });

  const animatedImageStyles = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [0, maxScroll], [1.36, 1], {
      extrapolateRight: Extrapolation.CLAMP,
    });
    return { transform: [{ scale }] };
  });

  const backButtonStyles = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, maxScroll * 0.75], [0.7, 0]);
    return { opacity };
  });

  return {
    scrollAnimatedStyles,
    headerViewAnimatedStyles,
    titleAnimatedStyles,
    animatedImageStyles,
    backButtonStyles,
  };
}
