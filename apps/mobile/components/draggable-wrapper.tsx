import React, { ComponentPropsWithoutRef, forwardRef, useImperativeHandle } from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { SharedValue, WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type DragDirection = 'horizontal' | 'vertical' | 'both';

interface DraggableWrapperRef {
  /**
   * Shared value for horizontal translation.
   */
  translateX: SharedValue<number>;

  /**
   * Shared value for vertical translation.
   */
  translateY: SharedValue<number>;

  /**
   * Resets the position of the draggable element to its initial state.
   */
  resetPosition: () => void;

  /**
   * Dismisses the draggable element by animating it out of view.
   */
  dismiss: () => void;
}

interface DraggableWrapperProps extends ComponentPropsWithoutRef<typeof Animated.View> {
  /**
   * The child components to render inside the draggable wrapper.
   */
  children: React.ReactNode;

  /**
   * The direction in which the element can be dragged.
   * - `horizontal`: Dragging is allowed only horizontally.
   * - `vertical`: Dragging is allowed only vertically.
   * - `both`: Dragging is allowed in both directions.
   */
  direction?: DragDirection;

  /**
   * Optional bounds to restrict the draggable area.
   */
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };

  /**
   * Enables inertia when dragging ends. Defaults to `true`.
   */
  enableInertia?: boolean;

  /**
   * Callback triggered when the element is dismissed.
   */
  onDismiss?: () => void;

  /**
   * Callback triggered when dragging starts.
   */
  onDragStart?: () => void;

  /**
   * Callback triggered during dragging with the current position.
   */
  onDrag?: (position: { x: number; y: number }) => void;

  /**
   * Callback triggered when dragging ends.
   */
  onDragEnd?: () => void;

  /**
   * Callback triggered when the gesture is canceled.
   */
  onCancel?: () => void;

  /**
   * Callback triggered when the gesture fails.
   */
  onFail?: () => void;

  /**
   * Ratio of the screen size that determines the dismiss threshold. Defaults to `0.5`.
   */
  dismissThresholdRatio?: number;

  /**
   * Multiplier for the dismiss distance when animating out. Defaults to `2`.
   */
  dismissDistanceMultiplier?: number;

  /**
   * Whether to fade out the element when dismissed. Defaults to `false`.
   */
  fadeOnDismiss?: boolean;

  /**
   * Whether to scale down the element when dismissed. Defaults to `false`.
   */
  scaleOnDismiss?: boolean;

  /**
   * Configuration for the spring animation.
   */
  springConfig?: WithSpringConfig;

  /**
   * Configuration for the timing animation.
   */
  timingConfig?: WithTimingConfig;

  /**
   * Disables dragging if set to `true`. Defaults to `false`.
   */
  disabled?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * A wrapper component that makes its children draggable with customizable behavior.
 *
 * This component supports dragging in horizontal, vertical, or both directions. It provides
 * callbacks for various drag events and allows customization of animations, dismiss behavior,
 * and bounds.
 *
 * @example
 * ```tsx
 * <DraggableWrapper
 *   direction="both"
 *   onDismiss={() => console.log('Dismissed')}
 * >
 *   <Text>Drag me!</Text>
 * </DraggableWrapper>
 * ```
 */
const DraggableWrapper = forwardRef<DraggableWrapperRef, DraggableWrapperProps>(
  (
    {
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
    },
    ref
  ) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const THRESHOLD_X = SCREEN_WIDTH * dismissThresholdRatio;
    const THRESHOLD_Y = SCREEN_HEIGHT * dismissThresholdRatio;

    useImperativeHandle(ref, () => ({
      translateX,
      translateY,
      resetPosition: () => {
        translateX.value = withSpring(0, springConfig);
        translateY.value = withSpring(0, springConfig);
        opacity.value = withTiming(1, { duration: 200 });
      },
      dismiss: () => {
        const screenWidth = Dimensions.get('window').width;
        const screenHeight = Dimensions.get('window').height;

        const animateOutX =
          direction === 'horizontal' || direction === 'both'
            ? withSpring(
                Math.sign(translateX.value) >= 0 ? screenWidth : -screenWidth,
                springConfig
              )
            : translateX.value;

        const animateOutY =
          direction === 'vertical' || direction === 'both'
            ? withSpring(
                Math.sign(translateY.value) >= 0 ? screenHeight : -screenHeight,
                springConfig
              )
            : translateY.value;

        translateX.value = animateOutX;
        translateY.value = animateOutY;

        opacity.value = withTiming(0, { duration: 150 }, (isFinished) => {
          if (isFinished && onDismiss) runOnJS(onDismiss)();
        });
      },
    }));

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
  }
);

DraggableWrapper.displayName = 'DraggableWrapper';

export { DraggableWrapper };
export type { DragDirection, DraggableWrapperProps, DraggableWrapperRef };
