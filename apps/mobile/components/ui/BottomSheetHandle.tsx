import { getColor, getPrimaryColor } from '@/lib/colors';
import { createDirectionalShadow } from '@/lib/utils/shadows';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { toRad } from 'react-native-redash';

export const HANDLEHEIGHT = 30;

// @ts-expect-error Unknown type
export const transformOrigin = ({ x, y }, ...transformations) => {
  'worklet';
  return [
    { translateX: x },
    { translateY: y },
    ...transformations,
    { translateX: x * -1 },
    { translateY: y * -1 },
  ];
};

interface HandleProps extends BottomSheetHandleProps {
  style?: StyleProp<ViewStyle>;
}

export const BottomSheetHandle: React.FC<HandleProps> = ({ style, animatedIndex }) => {
  //#region animations
  const indicatorTransformOriginY = useDerivedValue(() =>
    interpolate(animatedIndex.value, [0, 1, 2], [-1, 0, 1], Extrapolation.CLAMP)
  );
  //#endregion

  //#region styles
  const topShadow = useMemo(() => createDirectionalShadow('top', 'md', 0.08), []);
  const containerStyle = useMemo(() => [styles.header, style], [style, styles.header]);
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderTopRadius = interpolate(animatedIndex.value, [1, 2], [20, 0], Extrapolation.CLAMP);
    return {
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
    };
  });
  const leftIndicatorStyle = useMemo(
    () => ({
      ...styles.indicator,
      ...styles.leftIndicator,
    }),
    [styles.indicator, styles.leftIndicator]
  );
  const leftIndicatorAnimatedStyle = useAnimatedStyle(() => {
    const leftIndicatorRotate = interpolate(
      animatedIndex.value,
      [0, 1, 2],
      [toRad(-30), 0, toRad(30)],
      Extrapolation.CLAMP
    );
    return {
      transform: transformOrigin(
        { x: 0, y: indicatorTransformOriginY.value },
        {
          rotate: `${leftIndicatorRotate}rad`,
        },
        {
          translateX: -6,
        }
      ),
    };
  });
  const rightIndicatorStyle = useMemo(
    () => ({
      ...styles.indicator,
      ...styles.rightIndicator,
    }),
    [styles.indicator, styles.rightIndicator]
  );
  const rightIndicatorAnimatedStyle = useAnimatedStyle(() => {
    const rightIndicatorRotate = interpolate(
      animatedIndex.value,
      [0, 1, 2],
      [toRad(30), 0, toRad(-30)],
      Extrapolation.CLAMP
    );
    return {
      transform: transformOrigin(
        { x: 0, y: indicatorTransformOriginY.value },
        {
          rotate: `${rightIndicatorRotate}rad`,
        },
        {
          translateX: 6,
        }
      ),
    };
  });
  //#endregion

  // render
  return (
    <Animated.View style={[topShadow, { borderRadius: 20 }]}>
      <Animated.View
        style={[containerStyle, containerAnimatedStyle]}
        renderToHardwareTextureAndroid={true}
      >
        <Animated.View style={[leftIndicatorStyle, leftIndicatorAnimatedStyle]} />
        <Animated.View style={[rightIndicatorStyle, rightIndicatorAnimatedStyle]} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: HANDLEHEIGHT,
    backgroundColor: getColor('background', '0'),
  },
  indicator: {
    position: 'absolute',
    width: 12,
    height: 4,
    backgroundColor: getPrimaryColor('500'),
  },
  leftIndicator: {
    borderTopStartRadius: 2,
    borderBottomStartRadius: 2,
  },
  rightIndicator: {
    borderTopEndRadius: 2,
    borderBottomEndRadius: 2,
  },
});
