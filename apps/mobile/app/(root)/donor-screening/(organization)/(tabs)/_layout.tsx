import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import ScreeningFormActionMenu from '@/features/donor-screening/components/ScreeningFormActionMenu';
import { useMyOrgScreeningForm } from '@/features/donor-screening/hooks/useMyOrgScreeningForm';
import { useTabScreenOptions } from '@/hooks/useScreenOptions';
import { Tabs } from 'expo-router';
import { MailboxIcon, ScrollTextIcon } from 'lucide-react-native';

export default function OrganizationTabsLayout() {
  const { form } = useMyOrgScreeningForm({ _status: 'published' });
  const tabScreenOptions = useTabScreenOptions();

  return (
    <Tabs
      initialRouteName="form"
      screenOptions={{
        ...tabScreenOptions,
        tabBarPosition: 'bottom',
        tabBarLabelPosition: 'below-icon',
        animation: 'shift',
        sceneStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Tabs.Screen
        name="form"
        options={{
          headerShown: true,
          headerTitle: form?.title || 'Screening Form',
          headerLeft: (props) => (
            <Box className="px-2">
              <HeaderBackButton {...props} marginRight={8} />
            </Box>
          ),
          headerRight: ({ tintColor }) => (
            <ScreeningFormActionMenu tintColor={tintColor} formID={form?.id} />
          ),
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
          headerShown: true,
          headerTitle: 'Form Submissions',
          headerLeft: (props) => (
            <Box className="px-2">
              <HeaderBackButton {...props} marginRight={8} />
            </Box>
          ),
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
