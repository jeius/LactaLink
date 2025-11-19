import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Button, ButtonIcon } from '@/components/ui/button';
import { AlertCircleIcon, LucideIcon, LucideProps, XIcon } from 'lucide-react-native';
import React, { FC } from 'react';
import Animated from 'react-native-reanimated';

const AnimatedAlert = Animated.createAnimatedComponent(Alert);

interface HintAlertProps {
  onClose?: () => void;
  message: string;
  icon?: LucideIcon | FC<LucideProps>;
  visible: boolean;
}

export function HintAlert({ onClose, message, icon = AlertCircleIcon, visible }: HintAlertProps) {
  return (
    visible && (
      <AnimatedAlert
        // entering={FadeIn}
        // exiting={FadeOut}
        variant="solid"
        action="info"
        className="items-start rounded-lg"
      >
        <AlertIcon as={icon} size="md" />
        <AlertText className="flex-1">{message}</AlertText>
        <Button
          variant="link"
          action="info"
          className="h-fit w-fit p-0"
          hitSlop={8}
          onPress={onClose}
        >
          <ButtonIcon as={XIcon} />
        </Button>
      </AnimatedAlert>
    )
  );
}
