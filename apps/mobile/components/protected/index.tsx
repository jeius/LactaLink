import { useSession } from '@/hooks/useSession';
import { getHexColor } from '@/lib/colors';
import { userHasProfile } from '@/lib/utils/userHasProfile';
import { cn } from '@gluestack-ui/nativewind-utils/cn';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useTheme } from '../providers/theme-provider';
import { Spinner } from '../ui/spinner';

export function Protected({ className, ...props }: SafeAreaViewProps) {
  const { user, session, isLoading } = useSession();
  const { theme } = useTheme();
  useEffect(() => {
    if (!isLoading) {
      if (!user || !session) {
        router.replace('/sign-in');
      }
      if (user && userHasProfile(user)) {
        router.replace('/setup-profile');
      }
    }
  }, [user, session, isLoading]);

  if (isLoading || !user || !session) {
    return (
      <SafeAreaView className="bg-background-50 relative flex-1 items-center justify-center">
        <Spinner color={getHexColor(theme, 'primary', 500)} size={'large'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={cn('bg-background-50 relative flex-1 items-center justify-center', className)}
      {...props}
    />
  );
}
