import { Toaster } from '@/lib/toaster';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { OverlayProvider } from '@gluestack-ui/overlay';
import { ToastProvider } from '@gluestack-ui/toast';

import { ComponentPropsWithRef, FC } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '../ui/box';

const style = tva({
  base: 'bg-background-50 justifiy-center relative flex-1 flex-col items-stretch',
});

export type SafeAreaProps = ComponentPropsWithRef<typeof Box>;

const SafeArea: FC<SafeAreaProps> = ({ className, children, ...props }) => {
  return (
    <SafeAreaView className="flex-1">
      <Box className={style({ class: className })} {...props}>
        <OverlayProvider>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </OverlayProvider>
      </Box>
    </SafeAreaView>
  );
};

export default SafeArea;
