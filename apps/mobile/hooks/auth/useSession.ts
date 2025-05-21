import { getAuth, signIn, signOut, signUp } from '@/auth';
import { googleSignIn } from '@/auth/googleSignIn';
import { QUERY_KEYS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { AuthResult } from '@lactalink/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const KEY = QUERY_KEYS.AUTH.ALL;

export function useSession() {
  const queryClient = useQueryClient();

  const {
    data: auth,
    isLoading,
    isError,
    refetch,
  } = useQuery<AuthResult | null>({
    queryKey: KEY,
    queryFn: getAuth,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false,
  });

  const signInMutation = useMutation({
    mutationFn: signIn,
    onSuccess: (data) => {
      queryClient.setQueryData(KEY, data);
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: googleSignIn,
    onSuccess: (data) => {
      queryClient.setQueryData(KEY, data);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      queryClient.setQueryData(KEY, data);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(KEY, null);
    },
  });

  const user = (auth && 'data' in auth && auth.data.user) || null;
  const token = (auth && 'data' in auth && auth.data.token) || null;

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      refetch();

      if (event === 'INITIAL_SESSION') {
        // handle initial session
      } else if (event === 'SIGNED_IN') {
        // handle sign in event
      } else if (event === 'SIGNED_OUT') {
        // handle sign out event
      } else if (event === 'PASSWORD_RECOVERY') {
        // handle password recovery event
      } else if (event === 'TOKEN_REFRESHED') {
        // handle token refreshed event
      } else if (event === 'USER_UPDATED') {
        // handle user updated event
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [refetch]);

  return {
    user,
    token,
    isLoading,
    isError,
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    googleAuth: googleAuthMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    refetchSession: refetch,
  };
}
