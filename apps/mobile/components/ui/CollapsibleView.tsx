import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface CollapsibleViewProps extends ViewProps {
  expand: boolean;
}

function CollapsibleView({ expand, children, ...props }: CollapsibleViewProps) {
  const expanded = useSharedValue(expand);
  const height = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(expanded.value ? height.value : 0, {
        easing: Easing.inOut(Easing.ease),
        duration: 300,
      }),
    };
  });

  useEffect(() => {
    expanded.value = expand;
  }, [expand, expanded]);

  return (
    <Animated.View
      {...props}
      style={[animatedContainerStyle, { overflow: 'hidden' }]}
      pointerEvents={expand ? 'auto' : 'none'}
    >
      <View
        style={{ position: 'absolute' }}
        onLayout={(e) => {
          const newHeight = e.nativeEvent.layout.height;
          if (height.value !== newHeight) {
            height.value = newHeight;
          }
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}

export default CollapsibleView;
