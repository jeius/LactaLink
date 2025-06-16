import { getHexColor } from '@/lib/colors';
import { FC } from 'react';
import { RefreshControlProps, RefreshControl as RNRefreshControl } from 'react-native';
import { useTheme } from './AppProvider/ThemeProvider';

export const RefreshControl: FC<RefreshControlProps> = (props) => {
  const { theme } = useTheme();
  const tintColor = getHexColor(theme, 'primary', 500);
  const bgColor = getHexColor(theme, 'background', 50);
  return (
    <RNRefreshControl
      {...props}
      colors={tintColor ? [tintColor] : undefined}
      progressBackgroundColor={bgColor}
    />
  );
};
