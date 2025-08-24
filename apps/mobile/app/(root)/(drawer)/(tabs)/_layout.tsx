import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BottomTabBar } from '@/components/BottomTabBar';
import { ScrollProvider } from '@/components/contexts/ScrollProvider';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout() {
  const { themeColors } = useTheme();
  const bgColor = themeColors.background[50];

  return (
    <ScrollProvider>
      <Tabs
        initialRouteName="feed"
        tabBar={(props) => <BottomTabBar {...props} />}
        screenOptions={{
          animation: 'shift',
          headerShown: false,
          sceneStyle: { backgroundColor: bgColor },
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen name="feed" />
        <Tabs.Screen name="history" />
        <Tabs.Screen name="notifications" />
        <Tabs.Screen name="messages" />
      </Tabs>
    </ScrollProvider>
  );
}
