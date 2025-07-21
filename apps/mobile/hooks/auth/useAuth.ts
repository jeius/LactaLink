import { QUERY_KEYS } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useAuth() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const [enableFetchUser, setEnableFetchUser] = useState(false);

  const { data: session, ...sessionQuery } = useQuery({
    queryKey: QUERY_KEYS.AUTH.SESSION,
    queryFn: () => apiClient.auth.getSession(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const { data: user, ...userQuery } = useQuery({
    enabled: enableFetchUser,
    initialData: session?.user || null,
    queryKey: QUERY_KEYS.AUTH.USER,
    queryFn: () => apiClient.auth.getMeUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  const profile = user?.profile?.value || null;
  const profileCollection = user?.profile?.relationTo || null;

  useEffect(() => {
    queryClient.setQueryData(QUERY_KEYS.AUTH.USER, session?.user || null);
    setEnableFetchUser(Boolean(session));
  }, [session, queryClient]);

  return {
    // Session data
    user,
    profile,
    profileCollection,
    session,

    // Loading states
    isLoading: sessionQuery.isLoading || userQuery.isLoading,
    isFetching: sessionQuery.isFetching || userQuery.isFetching,
    isError: sessionQuery.isError || userQuery.isError,
    isRefetching: sessionQuery.isRefetching || userQuery.isRefetching,
    error: sessionQuery.error || userQuery.error,

    // Manual refetch
    refetchSession: sessionQuery.refetch,
    refetchUser: userQuery.refetch,
  };
}

export function useAuthListener() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  // Set up auth state change listener
  useEffect(() => {
    const subscription = apiClient.auth.onAuthStateChange((event) => {
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in');
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.SESSION });
          break;
        case 'SIGNED_OUT':
          console.log('User signed out');
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ALL });
          if (GoogleSignin.hasPreviousSignIn()) {
            GoogleSignin.signOut();
          }
          break;
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed');
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.SESSION });
          break;
        default:
          break;
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [apiClient, queryClient]);
}
