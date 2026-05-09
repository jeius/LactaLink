import { Button, ButtonIcon } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Link, Stack } from 'expo-router';
import { UserCog2Icon } from 'lucide-react-native';

export default function AccountLayout() {
  const screenOptions = useScreenOptions();
  const { profileCollection } = useAuth();
  const isOrganization = profileCollection === 'hospitals' || profileCollection === 'milkBanks';

  return (
    <Stack
      screenOptions={{
        ...screenOptions,
        headerShown: true,
      }}
    >
      <Stack.Protected guard={isOrganization}>
        <Stack.Screen name="inventory" options={{ headerTitle: 'Milk Inventory' }} />
      </Stack.Protected>

      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Account',
          headerRight: () => (
            <Link asChild push href={'/account/settings'}>
              <Button className="h-fit w-fit p-3">
                <ButtonIcon as={UserCog2Icon} />
              </Button>
            </Link>
          ),
        }}
      />
      <Stack.Screen name="donations/incoming" options={{ headerTitle: 'Incoming Donations' }} />
      <Stack.Screen name="requests/incoming" options={{ headerTitle: 'Incoming Requests' }} />
      <Stack.Screen name="deliveries" options={{ headerTitle: 'Deliveries' }} />
      <Stack.Screen name="transactions" options={{ headerTitle: 'Transactions' }} />
      <Stack.Screen name="notifications" options={{ headerTitle: 'Notifications' }} />
      <Stack.Screen name="settings" options={{ headerTitle: 'Account Settings' }} />
    </Stack>
  );
}
