import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Button, ButtonIcon } from '@/components/ui/button';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { AlertCircleIcon, LucideIcon, LucideProps, XIcon } from 'lucide-react-native';
import React, { FC } from 'react';

interface HintAlertProps {
  onClose?: () => void;
  message: string;
  icon?: LucideIcon | FC<LucideProps>;
  visible: boolean;
}

export function HintAlert({ onClose, message, icon = AlertCircleIcon, visible }: HintAlertProps) {
  return (
    <AnimatePresence>
      {visible && (
        <Motion.View
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Alert variant="solid" action="info" className="items-start">
            <AlertIcon as={icon} size="md" />
            <AlertText className="shrink">{message}</AlertText>
            <Button
              variant="link"
              action="info"
              className="h-fit w-fit"
              hitSlop={8}
              onPress={onClose}
            >
              <ButtonIcon as={XIcon} className="text-info-600" />
            </Button>
          </Alert>
        </Motion.View>
      )}
    </AnimatePresence>
  );
}
