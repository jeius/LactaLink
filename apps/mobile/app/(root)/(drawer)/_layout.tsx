import { HeaderProvider } from '@/components/contexts/HeaderProvider';
import { NavigationDrawerContent } from '@/components/drawer/NavigationDrawer';
import { MilkBottleIcon } from '@/components/ui/icon/custom';
import { Drawer } from 'expo-router/drawer';
import { Building2Icon, BuildingIcon, HomeIcon, LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';

export default function DrawerLayout() {
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
        screenOptions={{ headerShown: false }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Home',
            drawerIcon: HomeIcon,
          }}
        />

        <Drawer.Screen
          name="listings"
          options={{
            drawerLabel: 'Available Listings',
            drawerIcon: MilkBottleIcon as LucideIcon,
          }}
        />

        <Drawer.Screen
          name="hospitals"
          options={{
            drawerLabel: 'Hospitals',
            drawerIcon: Building2Icon,
          }}
        />

        <Drawer.Screen
          name="milk-banks"
          options={{
            drawerLabel: 'Milk Banks',
            drawerIcon: BuildingIcon,
          }}
        />
      </Drawer>
    </HeaderProvider>
  );
}
