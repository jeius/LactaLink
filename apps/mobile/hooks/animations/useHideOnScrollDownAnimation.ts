import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Direction = 'upward' | 'downward';

interface Config {
  duration?: number;
  direction?: Direction;
}

/**
 * Reanimated hook that hides/shows a header on scroll down/up
 * and returns derived translateY/opacity + a scrollHandler to attach to the ScrollView/FlatList.
 */
export function useHideOnScrollDownAnimation(height: number, config: Config = {}) {
  const duration = config.duration ?? 500;
  const direction = config.direction ?? 'upward';

  // persistent values
  const offset = useSharedValue(0);
  const scroll = useSharedValue(0);
  const lastScroll = useSharedValue(0);
  const clampedScroll = useSharedValue(0);

  // derive visible transforms from clamped value
  const translateY = useDerivedValue(() => {
    const target = direction === 'upward' ? -height : height;
    return interpolate(clampedScroll.value, [0, height], [0, target], Extrapolation.CLAMP);
  });

  const opacity = useDerivedValue(() => {
    return interpolate(
      clampedScroll.value,
      [0, height - 20, height],
      [1, 0.05, 0],
      Extrapolation.CLAMP
    );
  });

  // scroll handler that updates scroll and manually clamps like the original
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const current = event.contentOffset.y;
      const diff = current - lastScroll.value;

      scroll.value = current;
      lastScroll.value = current;

      // Manual clamping logic matching the original addListener approach
      clampedScroll.value = Math.min(Math.max(clampedScroll.value + diff, 0), height);
    },

    onEndDrag: () => {
      const shouldHide = scroll.value > height && clampedScroll.value > height / 2;
      const toValue = shouldHide ? offset.value + height : offset.value - height;
      offset.value = withTiming(toValue, { duration });
    },

    onMomentumEnd: () => {
      const shouldHide = scroll.value > height && clampedScroll.value > height / 2;
      const toValue = shouldHide ? offset.value + height : offset.value - height;
      offset.value = withTiming(toValue, { duration });
    },
  });

  return {
    translateY,
    opacity,
    scrollHandler,
    clamped: clampedScroll,
  } as const;
}
