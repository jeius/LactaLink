import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BottomTabBar } from '@/components/BottomTabBar';
import { ScrollProvider } from '@/components/contexts/ScrollProvider';
import { useNotification } from '@/hooks/notifications';
import { useHomeTabsBadgeStore } from '@/lib/stores/homeTabBadgeStore';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout() {
  useNotification();

  const { themeColors } = useTheme();
  const bgColor = themeColors.background[50];

  const notificationsBadgeState = useHomeTabsBadgeStore((s) => s.notifications);
  const newNotifCount = notificationsBadgeState.newDataIDs?.length;
  const notificationsBadge = newNotifCount
    ? newNotifCount > 100
      ? '99+'
      : newNotifCount.toString()
    : undefined;

  const transactionsBadgeState = useHomeTabsBadgeStore((s) => s.transactions);
  const newTransCount = transactionsBadgeState.newDataIDs?.length;
  const transactionsBadge = newTransCount > 0 ? '!' : undefined;

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
        <Tabs.Screen name="history" options={{ tabBarBadge: transactionsBadge }} />
        <Tabs.Screen name="notifications" options={{ tabBarBadge: notificationsBadge }} />
        <Tabs.Screen name="messages" />
      </Tabs>
    </ScrollProvider>
  );
}
