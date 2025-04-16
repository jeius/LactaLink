import { useSession } from '@/hooks/useSession';
import { Redirect } from 'expo-router';

export default function Page() {
  const { user } = useSession();

  if (user) return <Redirect href="./(root)/(tabs)/home" />;

  return <Redirect href="./(auth)/welcome" />;
}
