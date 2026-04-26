import { QUERY_KEYS } from '@/lib/constants';
import { User } from '@lactalink/types/payload-generated-types';
import { mutationOptions } from '@tanstack/react-query';
import { createLike, deleteLike } from '../api/likes';
import { LikableRelation } from '../types';

export function createAddLikeMutationOptions(doc: LikableRelation, user: User | null | undefined) {
  return mutationOptions({
    mutationKey: ['likes', 'create', doc.relationTo, doc.value.id],
    mutationFn: async () => {
      if (!user) throw new Error('User must be logged in to like a post or comment.');
      const userProfile = user.profile;
      if (!userProfile) throw new Error('User must setup a profile to like a post or comment.');
      return createLike({ doc, userProfile });
    },
    onSuccess: async (_data, _variables, _ctx, { client }) => {
      await client.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
    },
  });
}

export function createDeleteLikeMutationOptions(doc: LikableRelation) {
  return mutationOptions({
    mutationKey: ['likes', 'delete', doc.relationTo, doc.value.id],
    mutationFn: async (id: string) => {
      return deleteLike(id);
    },
    onSuccess: async (_data, _variables, _ctx, { client }) => {
      await client.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL });
    },
  });
}
