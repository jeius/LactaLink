import { useSession } from '@/hooks/useSession';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { Spinner } from '../ui/spinner';

export function Protected({ children }: SafeAreaViewProps) {
  const { user, session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      if (!user || !session) {
        router.replace('/sign-in');
      }
      // Todo: check if the user has no profile, then redirect
      // to setup profile.
    }
  }, [user, session, isLoading]);

  if (isLoading || !user || !session) return <Spinner size={'large'} />;

  return <SafeAreaView>{children}</SafeAreaView>;
}
