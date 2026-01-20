import { getColor, getPrimaryColor } from '@/lib/colors';
import { createDirectionalShadow } from '@/lib/utils/shadows';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { toRad } from 'react-native-redash';
import { Box } from './box';

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
  const outlineColor = useMemo(() => getColor('outline', '200'), []);
  const bgColor = useMemo(() => getColor('background', '0'), []);

  //#region animations
  const indicatorTransformOriginY = useDerivedValue(() =>
    interpolate(animatedIndex.value, [0, 1, 2], [-1, 0, 1], Extrapolation.CLAMP)
  );
  //#endregion

  //#region styles
  const topShadow = useMemo(() => createDirectionalShadow('top', 'md', 0.08), []);

  const containerStyle = [styles.header, style];
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderTopRadius = interpolate(animatedIndex.value, [1, 2], [20, 0], Extrapolation.CLAMP);
    const borderColor = interpolateColor(animatedIndex.value, [1, 2], [bgColor, outlineColor]);
    return {
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
      borderColor,
    };
  });

  const leftIndicatorStyle = { ...styles.indicator, ...styles.leftIndicator };
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

  const rightIndicatorStyle = { ...styles.indicator, ...styles.rightIndicator };
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
    <Animated.View style={[topShadow, { borderTopLeftRadius: 20, borderTopRightRadius: 20 }]}>
      <Box className="absolute inset-x-0 bottom-0 h-1 bg-background-0" />
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
    borderTopWidth: 1,
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
