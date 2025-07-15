import { AnimatePresence, Motion } from '@legendapp/motion';
import { LucideIcon, LucideProps, SaveIcon } from 'lucide-react-native';
import React, { FC } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Card } from './ui/card';
import { HStack } from './ui/hstack';

interface FloatingActionButtonProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmIcon?: LucideIcon | FC<LucideProps>;
}
export function FloatingActionButton({
  show,
  onCancel,
  onConfirm,
  confirmLabel = 'Apply',
  cancelLabel = 'Cancel',
  confirmIcon = SaveIcon,
}: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <AnimatePresence>
      {show && (
        <Motion.View
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            marginBottom: insets.bottom,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 8,
          }}
        >
          <Card className="mx-auto p-4">
            <HStack space="md" className="justify-end">
              <Button onPress={onConfirm}>
                <ButtonIcon as={confirmIcon} />
                <ButtonText>{confirmLabel}</ButtonText>
              </Button>

              <Button variant="outline" action="default" onPress={onCancel}>
                <ButtonText>{cancelLabel}</ButtonText>
              </Button>
            </HStack>
          </Card>
        </Motion.View>
      )}
    </AnimatePresence>
  );
}
