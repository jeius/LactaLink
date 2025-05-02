// import { useSession } from '@/hooks/useSession';
// import { MMKV_KEYS } from '@/lib/constants';
// import Storage from '@/lib/localStorage';
import { Redirect } from 'expo-router';

export default function Page() {
  // const viewedOnboarding = Storage.getBoolean(MMKV_KEYS.ONBOARDING);
  // const { user } = useSession();

  // if (user) return <Redirect href="./(root)/(tabs)/home" />;

  // if (viewedOnboarding) return <Redirect href="/(auth)/sign-in" />;

  // return <Redirect href="/(auth)/welcome" />;

  return <Redirect href="/(auth)/sign-up" />;
}
