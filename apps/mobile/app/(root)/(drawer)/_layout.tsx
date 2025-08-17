import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ProfileAvatar } from '@/components/Avatar';
import { NavigationDrawerContent } from '@/components/drawer/NavigationDrawer';
import DonateMilkIcon from '@/components/icons/DonateMilkIcon';
import HomeIcon from '@/components/icons/HomeIcon';
import InventoryIcon from '@/components/icons/InventoryIcon';
import MilkBottlePlusIcon from '@/components/icons/MilkBottlePlusIcon';
import { Icon } from '@/components/ui/icon';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { extractName } from '@lactalink/utilities/extractors';
import { Drawer } from 'expo-router/drawer';
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
  const isIndividual = profile?.relationTo === 'individuals';

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
          headerRight: () => <ProfileAvatar size="sm" profile={profile} enablePress />,
          headerRightContainerStyle: { paddingRight: 12 },
          drawerLabel: 'Home',
          drawerIcon: ({ color }) => <Icon as={HomeIcon} size="md" fill={color} stroke={color} />,
        }}
      />

      <Drawer.Screen
        name="donations"
        options={{
          title: 'Milk Donations',
          drawerLabel: 'Milk Donations',
          drawerIcon: ({ color }) => <Icon as={DonateMilkIcon} size="md" fill={color} />,
          headerShadowVisible: false,
        }}
      />

      <Drawer.Screen
        name="requests"
        options={{
          title: 'Milk Requests',
          drawerLabel: 'Milk Requests',
          drawerIcon: ({ color }) => <Icon as={MilkBottlePlusIcon} size="md" fill={color} />,
          headerShadowVisible: false,
        }}
      />

      <Drawer.Protected guard={!isIndividual}>
        <Drawer.Screen
          name="inventory"
          options={{
            title: 'Milk Inventory',
            drawerLabel: 'Milk Inventory',
            drawerIcon: ({ color }) => <Icon as={InventoryIcon} size="md" fill={color} />,
          }}
        />
      </Drawer.Protected>
    </Drawer>
  );
}
