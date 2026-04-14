import OrganizationsScreen from '@/components/screens/donor-screening/OrganizationsScreen';
import { Stack } from 'expo-router';

export default function DonorScreeningOrganizations() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Find Organizations' }} />
      <OrganizationsScreen />
    </>
  );
}
