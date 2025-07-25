import { AnimatePresence, Motion } from '@legendapp/motion';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { ComponentProps, FC } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';

interface BottomSheetActionButtonProps extends ComponentProps<typeof Button> {
  show: boolean;
  icon?: LucideIcon | FC<LucideProps>;
  label?: string;
}
export function BottomSheetActionButton({
  show,
  label,
  icon,
  ...props
}: BottomSheetActionButtonProps) {
  const insets = useSafeAreaInsets();
  return (
    <AnimatePresence>
      {show && (
        <Motion.View
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
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
        </Motion.View>
      )}
    </AnimatePresence>
  );
}
