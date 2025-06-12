import { useAuth } from '@/hooks/auth/useAuth';
import { MMKV_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { Redirect } from 'expo-router';

export default function EntryPage() {
  const viewedOnboarding = Storage.getBoolean(MMKV_KEYS.ONBOARDING);
  const { session } = useAuth();

  if (session) return <Redirect href="/home" />;

  if (viewedOnboarding) return <Redirect href="/auth/sign-in" />;

  return <Redirect href="/welcome" />;
}
