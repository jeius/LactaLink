import { useSession } from '@/hooks/auth/useSession';
import { getHexColor } from '@/lib/colors';
import { userHasProfile } from '@/lib/utils/userHasProfile';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaViewProps } from 'react-native-safe-area-context';
import { useTheme } from '../providers/theme-provider';
import SafeArea from '../safe-area';
import { Spinner } from '../ui/spinner';

export function Protected(props: SafeAreaViewProps) {
  const { user, token, isLoading } = useSession();
  const { theme } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (!user || !token) {
        router.replace('/auth/sign-in');
      }
      if (user && !userHasProfile(user)) {
        router.replace('/setup-profile');
      }
    }
  }, [user, token, isLoading]);

  if (isLoading || !user || !token) {
    return (
      <SafeArea>
        <Spinner color={getHexColor(theme, 'primary', 500)} size={'large'} />
      </SafeArea>
    );
  }

  return <SafeArea {...props} />;
}
