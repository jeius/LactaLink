import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BottomTabBar } from '@/components/BottomTabBar';
import { ScrollProvider } from '@/components/contexts/ScrollProvider';
import { useNotification } from '@/hooks/notifications';
import { useTransactionStore } from '@/lib/stores/transactionStore';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout() {
  const { unReadCount } = useNotification();
  const { newDataAvailable } = useTransactionStore((s) => s.badgeStates);

  const { themeColors } = useTheme();
  const bgColor = themeColors.background[50];

  const notificationsBadge = unReadCount && unReadCount > 100 ? '99+' : unReadCount?.toString();
  const transactionsBadge = newDataAvailable ? '!' : undefined;

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
