import { useRevalidateAllQueries } from '@/hooks/collections/useRevalidateQueries';
import { FC } from 'react';
import { RefreshControlProps } from 'react-native';
import { RefreshControl as RNRefreshControl } from 'react-native-gesture-handler';
import { useTheme } from './AppProvider/ThemeProvider';

export const RefreshControl: FC<RefreshControlProps> = ({ onRefresh, ...props }) => {
  const { themeColors } = useTheme();
  const revalidateQueries = useRevalidateAllQueries();

  const tintColor = themeColors.primary[500];
  const bgColor = themeColors.background[50];

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
