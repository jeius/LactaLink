import { cssInterop } from 'nativewind';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControlProps } from 'react-native';
import { RefreshControl as RNRefreshControl } from 'react-native-gesture-handler';
import { useTheme } from './AppProvider/ThemeProvider';

export function RefreshControl({ onRefresh, refreshing, ...props }: RefreshControlProps) {
  const [pulled, setPulled] = useState(false);
  const { themeColors } = useTheme();
  const tintColor = themeColors.primary[500];
  const bgColor = themeColors.background[50];

  useEffect(() => {
    if (!refreshing) setPulled(false);
  }, [refreshing]);

  const handleRefresh = useCallback(() => {
    onRefresh?.();
    setPulled(true);
  }, [onRefresh]);

  return (
    <RNRefreshControl
      {...props}
      refreshing={pulled && refreshing}
      colors={tintColor ? [tintColor] : undefined}
      progressBackgroundColor={bgColor}
      onRefresh={handleRefresh}
    />
  );
}

cssInterop(RefreshControl, { className: 'style' });
