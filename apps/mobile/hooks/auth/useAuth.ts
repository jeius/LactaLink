import { QUERY_KEYS } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import { Hospital, Individual, MilkBank } from '@lactalink/types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useAuth() {
  const apiClient = useApiClient();

  const {
    data: session,
    isLoading,
    isFetching,
    isError,
    refetch,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.AUTH.ALL,
    queryFn: () => apiClient.auth.getSession(),
    staleTime: 1000 * 60 * 10, // 5 minutes
    retry: false,
  });

  const user = session?.user || null;
  const profile = (session?.user?.profile?.value || null) as
    | Individual
    | Hospital
    | MilkBank
    | null;

  return {
    // Session data
    user,
    profile,
    session,

    // Loading states
    isLoading,
    isFetching,
    isError,
    error,

    // Manual refetch
    refetchSession: refetch,
  };
}

export function useAuthListener() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  // Set up auth state change listener
  useEffect(() => {
    const subscription = apiClient.auth.onAuthStateChange((event) => {
      // Invalidate session query on any auth state change
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.ALL });

      // Handle specific events if needed
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in');
          break;
        case 'SIGNED_OUT':
          console.log('User signed out');
          if (GoogleSignin.hasPreviousSignIn()) {
            GoogleSignin.signOut();
          }
          break;
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed');
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
