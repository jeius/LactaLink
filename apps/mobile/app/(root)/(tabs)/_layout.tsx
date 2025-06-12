import { BottomTabBar } from '@/components/BottomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        animation: 'shift',
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home/index" />
      <Tabs.Screen name="history/index" />
      <Tabs.Screen name="notifications/index" />
      <Tabs.Screen name="messages/index" />
    </Tabs>
  );
}
