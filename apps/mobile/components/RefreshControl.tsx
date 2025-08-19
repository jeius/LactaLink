import { useRevalidateQueries } from '@/hooks/collections/useRevalidateQueries';
import { getHexColor } from '@/lib/colors';
import { FC } from 'react';
import { RefreshControlProps } from 'react-native';
import { RefreshControl as RNRefreshControl } from 'react-native-gesture-handler';
import { useTheme } from './AppProvider/ThemeProvider';

export const RefreshControl: FC<RefreshControlProps> = ({ onRefresh, ...props }) => {
  const { theme } = useTheme();
  const revalidateQueries = useRevalidateQueries();

  const tintColor = getHexColor(theme, 'primary', 500);
  const bgColor = getHexColor(theme, 'background', 50);

  function handleRefresh() {
    if (onRefresh) {
      onRefresh();
    } else {
      revalidateQueries();
    }
  }

  return (
    <RNRefreshControl
      {...props}
      colors={tintColor ? [tintColor] : undefined}
      progressBackgroundColor={bgColor}
      onRefresh={handleRefresh}
    />
  );
};
