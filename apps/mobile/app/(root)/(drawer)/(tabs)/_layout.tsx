import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BottomTabBar } from '@/components/BottomTabBar';
import { ScrollProvider } from '@/components/contexts/ScrollProvider';
import { useLiveNotifications } from '@/hooks/live-updates/useLiveNotifications';
import { useNotification } from '@/hooks/notifications';
import { useTransactions } from '@/hooks/transactions';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Layout() {
  useLiveNotifications();

  const { unSeenCount: notifUnseenCount } = useNotification();
  const { unSeenCount: transUnseenCount } = useTransactions();

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
        <Tabs.Screen name="active-transactions" options={{ tabBarBadge: transUnseenCount }} />
        <Tabs.Screen name="notifications" options={{ tabBarBadge: notifUnseenCount }} />
        <Tabs.Screen name="messages" />
      </Tabs>
    </ScrollProvider>
  );
}
