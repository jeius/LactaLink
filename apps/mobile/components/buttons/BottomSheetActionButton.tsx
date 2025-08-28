import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { ComponentProps, FC } from 'react';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHideOnScrollAnimation, useScroll } from '../contexts/ScrollProvider';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';

interface BottomSheetActionButtonProps extends ComponentProps<typeof Button> {
  icon?: LucideIcon | FC<LucideProps>;
  label?: string;
  animateDistance?: number;
}

export function BottomSheetActionButton({
  label,
  icon,
  animateDistance = 100,
  ...props
}: BottomSheetActionButtonProps) {
  const insets = useSafeAreaInsets();

  const { scrollValue } = useScroll();
  const animatedStyle = useHideOnScrollAnimation(scrollValue, { animateDistance });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        animatedStyle,
      ]}
    >
      <Box
        className="bg-background-0 border-outline-200 rounded-2xl border p-4"
        style={{ paddingBottom: insets.bottom }}
      >
        <Button {...props}>
          {icon && <ButtonIcon as={icon} />}
          <ButtonText>{label}</ButtonText>
        </Button>
      </Box>
    </Animated.View>
  );
}
