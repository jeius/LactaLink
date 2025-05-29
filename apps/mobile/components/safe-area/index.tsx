import { tva } from '@gluestack-ui/nativewind-utils/tva';

import { ComponentPropsWithoutRef, FC } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '../ui/box';

const style = tva({
  base: 'bg-background-50 justifiy-center relative flex-1 flex-col items-center',
});

export type SafeAreaProps = ComponentPropsWithoutRef<typeof Box>;

const SafeArea: FC<SafeAreaProps> = ({ className, ...props }) => {
  const insets = useSafeAreaInsets();

  return (
    <Box
      className={style({ class: className })}
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      {...props}
    >
      {props.children}
    </Box>
  );
};

export default SafeArea;
