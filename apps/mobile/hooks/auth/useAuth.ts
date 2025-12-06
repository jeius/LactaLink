import { QUERY_KEYS } from '@/lib/constants';
import { meUserQueryOptions, sessionQueryOptions } from '@/lib/queries/authQueryOptions';
import { setMeUser } from '@/lib/stores/meUserStore';
import { useApiClient } from '@lactalink/api';
import { extractCollection } from '@lactalink/utilities/extractors';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useMeUser() {
  return useQuery(meUserQueryOptions);
}

export function useAuth() {
  const { data: session, ...sessionQuery } = useQuery(sessionQueryOptions);

  const user = session?.user || null;
  const profile = (user?.profile?.value && extractCollection(user.profile.value)) || null;
  const profileCollection = user?.profile?.relationTo || null;

  return {
    // Session data
    user,
    profile,
    profileCollection,
    session,

    // Loading states
    isLoading: sessionQuery.isLoading,
    isFetching: sessionQuery.isFetching,
    isError: sessionQuery.isError,
    isRefetching: sessionQuery.isRefetching,
    error: sessionQuery.error,

    // Manual refetch
    refetchSession: sessionQuery.refetch,
  };
}

export function useAuthListener() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const mutateSession = useMutation({
    mutationFn: () => apiClient.auth.getSession(),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, session);
      queryClient.setQueryData(meUserQueryOptions.queryKey, session?.user || null);
      setMeUser(session?.user || null);
    },
  });

  // Set up auth state change listener
  useEffect(() => {
    const subscription = apiClient.auth.onAuthStateChange((event, _session) => {
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in');
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.SESSION });
          break;
        case 'SIGNED_OUT':
          console.log('User signed out');
          if (GoogleSignin.hasPreviousSignIn()) GoogleSignin.signOut();

          queryClient.invalidateQueries({ refetchType: 'all' });

          queryClient.setQueryData(sessionQueryOptions.queryKey, null);
          queryClient.setQueryData(meUserQueryOptions.queryKey, null);
          setMeUser(null);
          break;
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed');
          mutateSession.mutate();
          break;
        default:
          break;
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [apiClient, mutateSession, queryClient]);
}
