import { useRevalidateAllQueries } from '@/hooks/collections/useRevalidateQueries';
import { FC, useEffect, useState } from 'react';
import { RefreshControlProps } from 'react-native';
import { RefreshControl as RNRefreshControl } from 'react-native-gesture-handler';
import { useTheme } from './AppProvider/ThemeProvider';

const RefreshControl: FC<RefreshControlProps> = ({ onRefresh, refreshing, ...props }) => {
  const { themeColors } = useTheme();
  const revalidateQueries = useRevalidateAllQueries();

  const [pulled, setPulled] = useState(false);

  const tintColor = themeColors.primary[500];
  const bgColor = themeColors.background[50];

  useEffect(() => {
    if (!refreshing) setPulled(false);
  }, [refreshing]);

  function handleRefresh() {
    if (onRefresh) {
      onRefresh();
    } else {
      revalidateQueries();
    }
    setPulled(true);
  }

  return (
    <RNRefreshControl
      {...props}
      refreshing={pulled && refreshing}
      colors={tintColor ? [tintColor] : undefined}
      progressBackgroundColor={bgColor}
      onRefresh={handleRefresh}
    />
  );
};

RefreshControl.displayName = 'RefreshControl';
export { RefreshControl };
