'use client';

import { QUERY_KEYS } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useAuth() {
  const apiClient = useApiClient();
  const queryClient = useQueryClient();

  // Set up auth state change listener
  useEffect(() => {
    const subscription = apiClient.auth.onAuthStateChange((event) => {
      // Invalidate session query on any auth state change
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.SESSION });

      // Handle specific events if needed
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in');
          break;
        case 'SIGNED_OUT':
          console.log('User signed out');
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

  const {
    data: session,
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.AUTH.SESSION,
    queryFn: () => apiClient.auth.getSession(),
    staleTime: 1000 * 60 * 10, // 5 minutes
    retry: false,
  });

  return {
    // Session data
    user: session?.user || null,
    session,

    // Loading states
    isLoading,
    isError,
    error,

    // Manual refetch
    refetchSession: refetch,
  };
}
