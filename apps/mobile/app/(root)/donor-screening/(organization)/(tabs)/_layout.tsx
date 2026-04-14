import { Icon } from '@/components/ui/icon';
import { getColor } from '@/lib/colors';
import { Tabs } from 'expo-router';
import { MailboxIcon, ScrollTextIcon } from 'lucide-react-native';

export default function OrganizationTabsLayout() {
  return (
    <Tabs
      initialRouteName="form"
      screenOptions={{
        sceneStyle: { backgroundColor: 'transparent' },
        tabBarStyle: { backgroundColor: getColor('background', '0') },
        tabBarInactiveTintColor: getColor('typography', '900'),
        tabBarActiveTintColor: getColor('primary', '500'),
        tabBarPosition: 'bottom',
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tabs.Screen
        name="form"
        options={{
          title: 'Screening Form',
          tabBarIcon: ({ color, size }) => (
            // @ts-expect-error - size is not typed correctly
            <Icon as={ScrollTextIcon} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="submissions"
        options={{
          title: 'Form Submissions',
          tabBarIcon: ({ color, size }) => (
            // @ts-expect-error - size is not typed correctly
            <Icon as={MailboxIcon} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
