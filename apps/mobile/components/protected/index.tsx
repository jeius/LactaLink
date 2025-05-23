import { useSession } from '@/hooks/auth/useSession';
import { router } from 'expo-router';
import { FC, useEffect } from 'react';
import SafeArea, { SafeAreaProps } from '../safe-area';
import { Spinner } from '../ui/spinner';

export const Protected: FC<SafeAreaProps> = (props) => {
  const { user, token, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      if (!user || !token) {
        router.replace('/auth/sign-in');
      }
      if (user && !user.profile) {
        router.replace('/setup-profile');
      }
    }
  }, [user, token, isLoading]);

  if (isLoading || !user || !token) {
    return (
      <SafeArea>
        <Spinner size={'large'} />
      </SafeArea>
    );
  }

  return <SafeArea {...props} />;
};
