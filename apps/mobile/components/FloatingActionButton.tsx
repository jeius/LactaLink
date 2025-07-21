import { AnimatePresence, Motion } from '@legendapp/motion';
import { LucideIcon, LucideProps, SaveIcon } from 'lucide-react-native';
import React, { FC } from 'react';
import { Box } from './ui/box';
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
  return (
    <AnimatePresence>
      {show && (
        <Motion.View
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 8,
          }}
        >
          <Card className="max-w-sm p-4">
            <HStack space="md" className="w-full">
              <Box className="flex-1">
                <Button onPress={onConfirm}>
                  <ButtonIcon as={confirmIcon} />
                  <ButtonText>{confirmLabel}</ButtonText>
                </Button>
              </Box>

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
