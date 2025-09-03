import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BottomTabBar } from '@/components/BottomTabBar';
import { ScrollProvider } from '@/components/contexts/ScrollProvider';
import { useNotification } from '@/hooks/notifications';
import { useTransactions } from '@/hooks/transactions';
import { useHomeTabsBadgeStore } from '@/lib/stores/homeTabBadgeStore';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout() {
  useNotification();
  useTransactions();

  const { themeColors } = useTheme();
  const bgColor = themeColors.background[50];

  const { notifications: notificationsBadgeState, transactions: transactionsBadgeState } =
    useHomeTabsBadgeStore();

  const newNotifCount = notificationsBadgeState.newDataIDs.length;
  const notificationsBadge =
    newNotifCount > 100 ? '99+' : newNotifCount === 0 ? undefined : newNotifCount.toString();

  const newTransCount = transactionsBadgeState.newDataIDs.length;
  const transactionsBadge =
    newTransCount > 100 ? '99+' : newTransCount === 0 ? undefined : newTransCount.toString();

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
        <Tabs.Screen name="active-transactions" options={{ tabBarBadge: transactionsBadge }} />
        <Tabs.Screen name="notifications" options={{ tabBarBadge: notificationsBadge }} />
        <Tabs.Screen name="messages" />
      </Tabs>
    </ScrollProvider>
  );
}
