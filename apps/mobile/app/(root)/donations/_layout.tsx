import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { HeaderAvatar } from '@/components/header/avatar';
import { getHexColor } from '@/lib/colors';
import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

export default function Layout() {
  const isIOS = Platform.OS === 'ios';
  const animation: StackAnimationTypes = isIOS ? 'ios_from_right' : 'slide_from_right';

  const { theme } = useTheme();
  const headerBgColor = getHexColor(theme, 'background', 0);
  const headerTintColor = getHexColor(theme, 'typography', 900);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerRight: () => <HeaderAvatar />,
        headerTitleStyle: {
          fontFamily: 'Jakarta-SemiBold',
          fontSize: 18,
        },
        headerStyle: { backgroundColor: headerBgColor?.toString() },
        headerBackButtonDisplayMode: 'minimal',
        headerBackVisible: true,
        headerTintColor: headerTintColor?.toString(),
        animation,
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: 'Donations' }} />
      <Stack.Screen name="create" options={{ headerTitle: 'Create Donation' }} />
    </Stack>
  );
}
