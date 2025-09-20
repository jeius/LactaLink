import { QUERY_KEYS } from '@/lib/constants';
import { setMeUser } from '@/lib/stores/meUserStore';
import { useApiClient } from '@lactalink/api';
import { extractCollection } from '@lactalink/utilities/extractors';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useMeUser() {
  const apiClient = useApiClient();
  return useQuery({
    initialData: null,
    queryKey: QUERY_KEYS.AUTH.USER,
    queryFn: async () => {
      const user = await apiClient.auth.getMeUser();
      setMeUser(user);
      return user;
    },
    staleTime: Infinity,
    retry: false,
  });
}

export function useAuth() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  const { data: session, ...sessionQuery } = useQuery({
    queryKey: QUERY_KEYS.AUTH.SESSION,
    queryFn: () => apiClient.auth.getSession(),
    staleTime: Infinity,
    retry: false,
  });

  const user = session?.user || null;
  const profile = (user?.profile?.value && extractCollection(user.profile.value)) || null;
  const profileCollection = user?.profile?.relationTo || null;

  useEffect(() => {
    const user = session?.user || null;
    queryClient.setQueryData(QUERY_KEYS.AUTH.USER, user);
    setMeUser(user);
  }, [session, queryClient]);

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
      queryClient.setQueryData(QUERY_KEYS.AUTH.SESSION, session);
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
          queryClient.setQueryData(QUERY_KEYS.AUTH.SESSION, null);
          queryClient.setQueryData(QUERY_KEYS.AUTH.USER, null);
          if (GoogleSignin.hasPreviousSignIn()) {
            GoogleSignin.signOut();
          }
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
