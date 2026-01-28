import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TransactionsLayout() {
  const screenOptions = useScreenOptions();
  const { themeColors } = useTheme();

  const inset = useSafeAreaInsets();
  const screen = useWindowDimensions();

  const allowedDetend = (screen.height - inset.top) / screen.height;
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="propose"
        options={{
          presentation: 'formSheet',
          contentStyle: { backgroundColor: themeColors.background[0] },
          animation: 'slide_from_bottom',
          sheetElevation: 24,
          sheetCornerRadius: 32,
          sheetAllowedDetents: [allowedDetend],
        }}
      />
    </Stack>
  );
}
