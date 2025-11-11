import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { HeaderProvider } from '@/components/contexts/HeaderProvider';
import { NavigationDrawerContent } from '@/components/drawer/NavigationDrawer';
import { Icon } from '@/components/ui/icon';
import { MilkBottleIcon } from '@/components/ui/icon/custom';
import { Drawer } from 'expo-router/drawer';
import { Building2Icon, BuildingIcon, HomeIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';

export default function Layout() {
  const { themeColors } = useTheme();
  const bgColor = themeColors.background[50];
  const activeTintColor = themeColors.primary[0];
  const activeBgColor = themeColors.primary[500];
  const inActiveTintColor = themeColors.typography[900];

  const [defaultStatus, setDefaultStatus] = useState<'open' | 'closed'>('closed');

  useEffect(() => {
    setDefaultStatus('open');
  }, []);

  return (
    <HeaderProvider>
      <Drawer
        drawerContent={NavigationDrawerContent}
        initialRouteName="(tabs)"
        backBehavior="initialRoute"
        defaultStatus={defaultStatus}
        screenOptions={{
          headerShown: false,
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
            drawerLabel: 'Home',
            drawerIcon: ({ color }) => <Icon as={HomeIcon} size="md" color={color} />,
          }}
        />

        <Drawer.Screen
          name="listings"
          options={{
            drawerLabel: 'Available Listings',
            drawerIcon: ({ color }) => <Icon as={MilkBottleIcon} size="md" color={color} />,
          }}
        />

        <Drawer.Screen
          name="hospitals"
          options={{
            drawerLabel: 'Hospitals',
            drawerIcon: ({ color }) => <Icon as={Building2Icon} size="md" color={color} />,
          }}
        />

        <Drawer.Screen
          name="milk-banks"
          options={{
            drawerLabel: 'Milk Banks',
            drawerIcon: ({ color }) => <Icon as={BuildingIcon} size="md" color={color} />,
          }}
        />
      </Drawer>
    </HeaderProvider>
  );
}
