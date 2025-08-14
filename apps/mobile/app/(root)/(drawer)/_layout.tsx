import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ProfileAvatar } from '@/components/Avatar';
import { NavigationDrawerContent } from '@/components/drawer/NavigationDrawer';
import DonateMilkIcon from '@/components/icons/DonateMilkIcon';
import HomeIcon from '@/components/icons/HomeIcon';
import MilkBottlePlusIcon from '@/components/icons/MilkBottlePlusIcon';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { getHexColor } from '@/lib/colors';
import { extractName } from '@lactalink/utilities/extractors';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect, useState } from 'react';

export default function Layout() {
  const { theme } = useTheme();
  const bgColor = getHexColor(theme, 'background', 50)?.toString();
  const activeTintColor = getHexColor(theme, 'primary', 0)?.toString();
  const activeBgColor = getHexColor(theme, 'primary', 500)?.toString();
  const inActiveTintColor = getHexColor(theme, 'typography', 900)?.toString();

  const { user, profile } = useAuth();
  const name = user && extractName(user);

  const screenOptions = useScreenOptions();

  const [defaultStatus, setDefaultStatus] = useState<'open' | 'closed'>('closed');

  useEffect(() => {
    setDefaultStatus('open');
  }, []);

  return (
    <Drawer
      drawerContent={NavigationDrawerContent}
      initialRouteName="(tabs)"
      backBehavior="initialRoute"
      defaultStatus={defaultStatus}
      screenOptions={{
        ...screenOptions,
        headerShown: true,
        drawerActiveTintColor: activeTintColor,
        drawerActiveBackgroundColor: activeBgColor,
        drawerItemStyle: {
          borderRadius: 14,
          height: 48,
        },
        drawerContentContainerStyle: { backgroundColor: bgColor },
        drawerContentStyle: { paddingTop: 12 },
        drawerStyle: { backgroundColor: bgColor },
        drawerInactiveTintColor: inActiveTintColor,
        drawerLabelStyle: { fontFamily: 'Jakarta-SemiBold', fontSize: 14, lineHeight: 18 },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: (name && `Welcome, ${name}!`) || 'Welcome!',
          headerRight: () => <ProfileAvatar size="sm" profile={profile} />,
          headerRightContainerStyle: { paddingRight: 12 },
          drawerLabel: 'Home',
          drawerIcon: ({ color }) => <Icon as={HomeIcon} size="md" fill={color} stroke={color} />,
        }}
      />

      <Drawer.Screen
        name="donations"
        options={{
          title: 'Donations',
          drawerLabel: 'Available Donations',
          drawerIcon: ({ color }) => <Icon as={DonateMilkIcon} size="md" fill={color} />,
          headerShadowVisible: false,
        }}
      />

      <Drawer.Screen
        name="requests"
        options={{
          title: 'Open Requests',
          drawerLabel: 'Open Requests',
          drawerIcon: ({ color }) => <Icon as={MilkBottlePlusIcon} size="md" fill={color} />,
          headerShadowVisible: false,
        }}
      />
    </Drawer>
  );
}
