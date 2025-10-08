import { LucideIcon, LucideProps, SaveIcon } from 'lucide-react-native';
import React, { FC } from 'react';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';

interface FloatingActionButtonProps extends React.ComponentProps<typeof Card> {
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
  ...props
}: FloatingActionButtonProps) {
  return (
    show && (
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutDown}
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
        }}
      >
        <Card {...props} className="mx-auto max-w-sm p-4">
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
      </Animated.View>
    )
  );
}
