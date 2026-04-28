import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BottomTabBar } from '@/components/BottomTabBar';
import { DrawerHeader } from '@/components/drawer/DrawerHeader';
import { useMyUnseenNotifCount } from '@/features/notifications/hooks/queries';
import { useInfiniteTransactions } from '@/features/transactions/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useLiveNotifications } from '@/hooks/live-updates/useLiveNotifications';
import { extractName } from '@lactalink/utilities/extractors';
import { Tabs } from 'expo-router';

export default function Layout() {
  useLiveNotifications();

  const { data: unSeenNotifCount = 0 } = useMyUnseenNotifCount();
  const { unseen: unseenTransactions } = useInfiniteTransactions();

  const { themeColors } = useTheme();
  const bgColor = themeColors.background[50];

  const { data: user } = useMeUser();
  const name = user && extractName(user);

  return (
    <>
      <DrawerHeader showSearch title={(name && `Welcome, ${name}!`) || 'Welcome!'} />
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
        <Tabs.Screen
          name="active-transactions"
          options={{ tabBarBadge: unseenTransactions.length }}
        />
        <Tabs.Screen name="notifications" options={{ tabBarBadge: unSeenNotifCount }} />
        <Tabs.Screen name="messages" />
      </Tabs>
    </>
  );
}
