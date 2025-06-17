import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BottomTabBar } from '@/components/BottomTabBar';
import { getHexColor } from '@/lib/colors';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout() {
  const { theme } = useTheme();
  const bgColor = getHexColor(theme, 'background', 50);
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        animation: 'shift',
        headerShown: false,
        sceneStyle: { backgroundColor: bgColor },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="home/index" />
      <Tabs.Screen name="history/index" />
      <Tabs.Screen name="notifications/index" />
      <Tabs.Screen name="messages/index" />
    </Tabs>
  );
}
