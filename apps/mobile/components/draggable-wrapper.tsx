import React, { ComponentPropsWithoutRef, FC } from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type DragDirection = 'horizontal' | 'vertical' | 'both';

export interface DraggableWrapperProps extends ComponentPropsWithoutRef<typeof Animated.View> {
  children: React.ReactNode;
  direction?: DragDirection;
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
  enableInertia?: boolean;
  onDismiss?: () => void;
  onDragStart?: () => void;
  onDrag?: (position: { x: number; y: number }) => void;
  onDragEnd?: () => void;
  onCancel?: () => void;
  onFail?: () => void;
  dismissThresholdRatio?: number;
  dismissDistanceMultiplier?: number;
  fadeOnDismiss?: boolean;
  scaleOnDismiss?: boolean;
  springConfig?: WithSpringConfig;
  timingConfig?: WithTimingConfig;
  disabled?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DraggableWrapper: FC<DraggableWrapperProps> = ({
  children,
  direction = 'horizontal',
  bounds,
  enableInertia = true,
  onDismiss,
  onDragStart,
  onDrag,
  onDragEnd,
  onCancel,
  onFail,
  dismissThresholdRatio = 0.5,
  dismissDistanceMultiplier = 2,
  fadeOnDismiss = false,
  scaleOnDismiss = false,
  springConfig = { damping: 20, stiffness: 350 },
  timingConfig = { duration: 300 },
  disabled = false,
  style,
  ...props
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const THRESHOLD_X = SCREEN_WIDTH * dismissThresholdRatio;
  const THRESHOLD_Y = SCREEN_HEIGHT * dismissThresholdRatio;

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .onBegin(() => {
      if (onDragStart) runOnJS(onDragStart)();
    })
    .onUpdate(({ translationX, translationY }) => {
      if (onDrag) runOnJS(onDrag)({ x: translationX, y: translationY });

      if (direction === 'horizontal' || direction === 'both') {
        const { minX = -Infinity, maxX = Infinity } = bounds || {};
        translateX.value = withSpring(clamp(minX, maxX, translationX), springConfig);
      }
      if (direction === 'vertical' || direction === 'both') {
        const { minY = -Infinity, maxY = Infinity } = bounds || {};
        translateY.value = withSpring(clamp(minY, maxY, translationY), springConfig);
      }
    })
    .onEnd((event) => {
      if (onDragEnd) runOnJS(onDragEnd)();

      const finalX = translateX.value + (enableInertia ? event.velocityX * 0.1 : 0);
      const finalY = translateY.value + (enableInertia ? event.velocityY * 0.1 : 0);

      let outOfBounds = false;
      if (direction === 'horizontal') {
        outOfBounds = Math.abs(finalX) > THRESHOLD_X;
      } else if (direction === 'vertical') {
        outOfBounds = Math.abs(finalY) > THRESHOLD_Y;
      } else {
        outOfBounds = Math.abs(finalX) > THRESHOLD_X || Math.abs(finalY) > THRESHOLD_Y;
      }

      if (outOfBounds && onDismiss) {
        if (fadeOnDismiss) opacity.value = withTiming(0, timingConfig);
        if (scaleOnDismiss) scale.value = withTiming(0.8, timingConfig);

        if (direction === 'horizontal' || direction === 'both') {
          translateX.value = withTiming(finalX * dismissDistanceMultiplier, timingConfig, () => {
            runOnJS(onDismiss)();
          });
        }

        if (direction === 'vertical' || direction === 'both') {
          translateY.value = withTiming(finalY * dismissDistanceMultiplier, timingConfig, () => {
            runOnJS(onDismiss)();
          });
        }
      } else {
        translateX.value = withSpring(0, springConfig);
        translateY.value = withSpring(0, springConfig);
        opacity.value = withSpring(1, springConfig);
        scale.value = withSpring(1, springConfig);
      }
    })
    .onTouchesCancelled(() => {
      if (onCancel) runOnJS(onCancel)();
    })
    .onFinalize((_, success) => {
      if (!success && onFail) runOnJS(onFail)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[animatedStyle, style]} {...props}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};
