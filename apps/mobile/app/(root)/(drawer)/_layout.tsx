import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ProfileAvatar } from '@/components/Avatar';
import { NavigationDrawerContent } from '@/components/drawer/NavigationDrawer';
import { Icon } from '@/components/ui/icon';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { extractName } from '@lactalink/utilities/extractors';
import { Drawer } from 'expo-router/drawer';
import { Building2Icon, BuildingIcon, HomeIcon, MilkIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';

export default function Layout() {
  const { themeColors } = useTheme();
  const bgColor = themeColors.background[50];
  const activeTintColor = themeColors.primary[0];
  const activeBgColor = themeColors.primary[500];
  const inActiveTintColor = themeColors.typography[900];

  const { data: user } = useMeUser();
  const name = user && extractName(user);
  const profile = user?.profile;

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
      //@ts-expect-error Expected type mismatch due to screenOptions custom type
      screenOptions={{
        ...screenOptions,
        headerShown: true,
        headerRightContainerStyle: { paddingRight: 12 },
        headerRight: () => <ProfileAvatar size="sm" profile={profile} enablePress />,
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
          drawerLabel: 'Home',
          drawerIcon: ({ color }) => <Icon as={HomeIcon} size="md" color={color} />,
        }}
      />

      <Drawer.Screen
        name="listings"
        options={{
          title: 'Donations & Requests',
          drawerLabel: 'Donations & Requests',
          drawerIcon: ({ color }) => <Icon as={MilkIcon} size="md" color={color} />,
          headerShadowVisible: false,
        }}
      />

      <Drawer.Screen
        name="hospitals"
        options={{
          title: 'Hospitals',
          drawerLabel: 'Hospitals',
          drawerIcon: ({ color }) => <Icon as={Building2Icon} size="md" color={color} />,
          headerShadowVisible: false,
        }}
      />

      <Drawer.Screen
        name="milk-banks"
        options={{
          title: 'Milk Banks',
          drawerLabel: 'Milk Banks',
          drawerIcon: ({ color }) => <Icon as={BuildingIcon} size="md" color={color} />,
          headerShadowVisible: false,
        }}
      />
    </Drawer>
  );
}
