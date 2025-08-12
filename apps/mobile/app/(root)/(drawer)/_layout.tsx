import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ProfileAvatar } from '@/components/Avatar';
import { NavigationDrawerContent } from '@/components/drawer/NavigationDrawer';
import BasicLocationPin from '@/components/icons/BasicLocationPin';
import HomeIcon from '@/components/icons/HomeIcon';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { getHexColor } from '@/lib/colors';
import { extractName } from '@lactalink/utilities/extractors';
import { Drawer } from 'expo-router/drawer';
import { TruckIcon } from 'lucide-react-native';
import React from 'react';

export default function Layout() {
  const { theme } = useTheme();
  const bgColor = getHexColor(theme, 'background', 50)?.toString();
  const activeTintColor = getHexColor(theme, 'primary', 0)?.toString();
  const activeBgColor = getHexColor(theme, 'primary', 500)?.toString();
  const inActiveTintColor = getHexColor(theme, 'typography', 900)?.toString();

  const { user, profile } = useAuth();
  const name = user && extractName(user);

  const screenOptions = useScreenOptions();

  return (
    <Drawer
      drawerContent={NavigationDrawerContent}
      initialRouteName="(tabs)"
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
          headerShown: true,
          headerTitle: (name && `Welcome, ${name}!`) || 'Welcome!',
          headerRight: () => <ProfileAvatar size="sm" profile={profile} />,
          drawerLabel: 'Home',
          drawerIcon: ({ color }) => <Icon as={HomeIcon} size="md" fill={color} stroke={color} />,
        }}
      />

      <Drawer.Screen
        name="addresses"
        options={{
          headerTitle: 'Addresses',
          drawerLabel: 'Addresses',
          drawerIcon: ({ color }) => <Icon as={BasicLocationPin} size="md" fill={color} />,
        }}
      />

      <Drawer.Screen
        name="delivery-preferences"
        options={{
          headerTitle: 'Delivery Preferences',
          drawerLabel: 'Delivery Preferences',
          drawerIcon: ({ color }) => <Icon as={TruckIcon} size="md" color={color} />,
        }}
      />
    </Drawer>
  );
}
