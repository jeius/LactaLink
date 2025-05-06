import { useSession } from '@/hooks/useSession';
import { getHexColor } from '@/lib/colors';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useTheme } from '../providers/theme-provider';
import { Spinner } from '../ui/spinner';

export function Protected(props: SafeAreaViewProps) {
  const { user, session, isLoading } = useSession();
  const { theme } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (!user || !session) {
        router.replace('/sign-in');
      }
      // Todo: check if the user has no profile, then redirect
      // to setup profile.
    }
  }, [user, session, isLoading]);

  if (isLoading || !user || !session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner color={getHexColor(theme, 'primary', 500)} size={'large'} />
      </SafeAreaView>
    );
  }

  return <SafeAreaView {...props} />;
}
