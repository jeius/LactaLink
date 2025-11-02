import { getHexColor } from '@/lib/colors';
import { shadow } from '@/lib/utils/shadows';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { Theme } from '@lactalink/types';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { toRad } from 'react-native-redash';
import { useTheme } from '../AppProvider/ThemeProvider';

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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const containerStyle = useMemo(() => [styles.header, style], [style, styles.header]);
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderTopRadius = interpolate(animatedIndex.value, [1, 5], [20, 0], Extrapolation.CLAMP);
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
    <Animated.View
      style={[containerStyle, containerAnimatedStyle]}
      className="bg-background-0"
      renderToHardwareTextureAndroid={true}
    >
      <Animated.View style={[leftIndicatorStyle, leftIndicatorAnimatedStyle]} />
      <Animated.View style={[rightIndicatorStyle, rightIndicatorAnimatedStyle]} />
    </Animated.View>
  );
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    header: {
      alignContent: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      height: 30,
      ...shadow.lg,
      shadowOffset: {
        width: 0,
        height: -3,
      },
    },
    indicator: {
      position: 'absolute',
      width: 12,
      height: 4,
      backgroundColor: getHexColor(theme, 'primary', 500),
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
}
