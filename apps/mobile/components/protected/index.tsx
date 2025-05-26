import { useAuth } from '@/hooks/auth/useSession';
import { router } from 'expo-router';
import { FC, useEffect } from 'react';
import SafeArea, { SafeAreaProps } from '../safe-area';
import { Spinner } from '../ui/spinner';

export const Protected: FC<SafeAreaProps> = (props) => {
  const { user, session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user || !session) {
        router.replace('/auth/sign-in');
      }
      if (user && !user.profile) {
        router.replace('/setup-profile');
      }
    }
  }, [user, session, isLoading]);

  if (isLoading || !user || !session) {
    return (
      <SafeArea>
        <Spinner size={'large'} />
      </SafeArea>
    );
  }

  return <SafeArea {...props} />;
};
