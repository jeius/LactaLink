import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function TransactionsLayout() {
  const { themeColors } = useTheme();
  const screenOptions = useScreenOptions();
  return (
    <Stack
      screenOptions={{
        ...screenOptions,
        contentStyle: { backgroundColor: themeColors.background[0] },
      }}
    />
  );
}
