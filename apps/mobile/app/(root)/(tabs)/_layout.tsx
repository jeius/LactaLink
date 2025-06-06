import { BottomTabBar } from '@/components/bottom-navbar';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <BottomTabBar {...props} />}
      screenOptions={{
        animation: 'shift',
        headerShown: true,
      }}
    >
      <Tabs.Screen name="home/index" />
      <Tabs.Screen name="transactions/index" />
      <Tabs.Screen name="notifications/index" />
      <Tabs.Screen name="messages/index" />
    </Tabs>
  );
}
