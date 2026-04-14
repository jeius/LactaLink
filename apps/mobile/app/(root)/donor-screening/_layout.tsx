import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';

export default function DonorScreeningLayout() {
  const screenOptions = useScreenOptions();
  const { user } = useAuth();

  const profile = user?.profile;
  const isOrganization = profile?.relationTo === 'hospitals' || profile?.relationTo === 'milkBanks';

  return (
    <Stack
      initialRouteName={isOrganization ? '(organization)' : 'index'}
      screenOptions={screenOptions}
    >
      <Stack.Protected guard={isOrganization}>
        <Stack.Screen name="(organization)" />
      </Stack.Protected>

      <Stack.Protected guard={!isOrganization}>
        <Stack.Screen name="index" />
        <Stack.Screen name="organizations" />
        <Stack.Screen name="form/[id]" />
      </Stack.Protected>
    </Stack>
  );
}
