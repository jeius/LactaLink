import { LucideIcon, LucideProps, SaveIcon } from 'lucide-react-native';
import React, { FC } from 'react';
import { GestureResponderEvent } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';

const AnimatedCard = Animated.createAnimatedComponent(Card);

interface FloatingActionButtonProps extends React.ComponentProps<typeof Card> {
  show: boolean;
  onConfirm?: (e: GestureResponderEvent) => void;
  onCancel?: (e: GestureResponderEvent) => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmIcon?: LucideIcon | FC<LucideProps> | null;
}
export function FloatingActionButton({
  show,
  onCancel,
  onConfirm,
  confirmLabel = 'Apply',
  cancelLabel = 'Cancel',
  confirmIcon = SaveIcon,
  ...props
}: FloatingActionButtonProps) {
  return (
    show && (
      <AnimatedCard
        {...props}
        entering={FadeInDown}
        exiting={FadeOutDown}
        className="absolute inset-x-3 bottom-3 max-w-sm p-4"
      >
        <HStack space="md">
          <Button className="grow" onPress={onConfirm}>
            {confirmIcon && <ButtonIcon as={confirmIcon} />}
            <ButtonText>{confirmLabel}</ButtonText>
          </Button>

          <Button className="shrink" variant="outline" action="default" onPress={onCancel}>
            <ButtonText>{cancelLabel}</ButtonText>
          </Button>
        </HStack>
      </AnimatedCard>
    )
  );
}
