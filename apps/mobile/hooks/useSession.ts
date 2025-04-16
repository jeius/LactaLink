import { CheckAuth } from '@/auth/checkAuth';
import { GoogleAuth } from '@/auth/googleAuth';
import { SignIn } from '@/auth/operations/signIn';
import { SignOut } from '@/auth/operations/signOut';
import { SignUp } from '@/auth/operations/signUp';
import { QUERY_KEYS } from '@/lib/constants';
import { AuthResult } from '@lactalink/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
    queryFn: CheckAuth,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false,
  });

  const signInMutation = useMutation({
    mutationFn: SignIn,
    onSuccess: (data) => {
      queryClient.setQueryData(KEY, data);
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: GoogleAuth,
    onSuccess: (data) => {
      queryClient.setQueryData(KEY, data);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: SignUp,
    onSuccess: (data) => {
      queryClient.setQueryData(KEY, data);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: SignOut,
    onSuccess: () => {
      queryClient.setQueryData(KEY, null);
    },
  });

  const user = (auth && auth.user) || null;
  const session = (auth && auth.token) || null;

  return {
    user,
    session,
    isLoading,
    isError,
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    googleAuth: googleAuthMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    refetchSession: refetch,
  };
}
