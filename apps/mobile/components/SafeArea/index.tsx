import { tva } from '@gluestack-ui/nativewind-utils/tva';

import { ComponentPropsWithoutRef, FC } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '../ui/box';

const style = tva({
  base: 'bg-background-50 relative flex-1 flex-col items-center justify-center',
});

export interface SafeAreaProps extends ComponentPropsWithoutRef<typeof Box> {
  safeX?: boolean;
  safeY?: boolean;
  safeTop?: boolean;
  safeBottom?: boolean;
  safeLeft?: boolean;
  safeRight?: boolean;
  mode?: 'padding' | 'margin';
}

const SafeArea: FC<SafeAreaProps> = ({
  className,
  safeBottom = true,
  safeLeft = true,
  safeRight = true,
  safeTop = true,
  safeX = true,
  safeY = true,
  mode = 'padding',
  ...props
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Box
      className={style({ class: className })}
      style={
        mode === 'margin'
          ? {
              marginTop: safeTop && safeY ? insets.top : 0,
              marginBottom: safeBottom && safeY ? insets.bottom : 0,
              marginRight: safeRight && safeX ? insets.right : 0,
              marginLeft: safeLeft && safeX ? insets.left : 0,
            }
          : {
              paddingTop: safeTop && safeY ? insets.top : 0,
              paddingBottom: safeBottom && safeY ? insets.bottom : 0,
              paddingRight: safeRight && safeX ? insets.right : 0,
              paddingLeft: safeLeft && safeX ? insets.left : 0,
            }
      }
      {...props}
    />
  );
};

export default SafeArea;
