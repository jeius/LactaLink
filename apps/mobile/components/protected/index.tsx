import { useAuth } from '@/hooks/auth/useAuth';
import { router } from 'expo-router';
import { FC, useEffect } from 'react';
import SafeArea, { SafeAreaProps } from '../safe-area';
import { Box } from '../ui/box';
import { Spinner } from '../ui/spinner';

export const Protected: FC<SafeAreaProps> = (props) => {
  const { user, session, isLoading, isFetching } = useAuth();

  useEffect(() => {
    if (!isLoading && !isFetching) {
      if (!session) {
        console.log('No session found, redirecting to sign-in');
        router.replace('/auth/sign-in');
      }
      if (user && !user.profile) {
        router.replace('/setup-profile');
      }
    }
  }, [user, session, isLoading, isFetching]);

  if (isLoading) {
    return (
      <SafeArea className="items-center justify-center">
        <Spinner size={'large'} />
      </SafeArea>
    );
  }

  return (
    <SafeArea className="justify-center" {...props}>
      {props.children}
      {isFetching && (
        <Box className="absolute right-3 top-0">
          <SafeArea>
            <Spinner size={'small'} />
          </SafeArea>
        </Box>
      )}
    </SafeArea>
  );
};
