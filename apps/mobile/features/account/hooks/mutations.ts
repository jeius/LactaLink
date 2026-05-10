import { useAuth } from '@/hooks/auth/useAuth';
import { useMutation } from '@tanstack/react-query';
import { createDeleteAccountMutation } from '../lib/mutations';

export function useDeleteAccountMutation() {
  const { user } = useAuth();

  return useMutation(createDeleteAccountMutation(user));
}
