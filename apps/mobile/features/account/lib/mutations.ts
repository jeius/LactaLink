import { getApiClient } from '@/lib/services';
import { User } from '@lactalink/types/payload-generated-types';
import { mutationOptions } from '@tanstack/react-query';

export function createDeleteAccountMutation(user: User | null) {
  return mutationOptions({
    mutationKey: ['deleteAccount', user?.id],
    mutationFn: async () => {
      if (!user) {
        throw new Error('Could not delete account: user not found');
      }
      return getApiClient().updateByID({
        collection: 'users',
        id: user.id,
        data: { deletedAt: new Date().toISOString() },
      });
    },
    onSuccess: async () => {
      await getApiClient().auth.signOut();
    },
  });
}
