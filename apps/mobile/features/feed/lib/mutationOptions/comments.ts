import { QUERY_KEYS } from '@/lib/constants';
import { getApiClient } from '@/lib/services';
import { getMeUser } from '@/lib/stores/meUserStore';
import { Comment } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { mutationOptions } from '@tanstack/react-query';

export function createNewCommentMutationOptions(postID: string) {
  return mutationOptions({
    meta: { errorMessage: (err) => extractErrorMessage(err) },
    mutationKey: ['add', 'comment', 'post', postID],
    mutationFn: async (data: Pick<Comment, 'content' | 'parent' | 'repliedTo'>) => {
      const user = getMeUser();
      if (!user) throw new Error('User must be logged in to comment.');

      const profile = user.profile;
      if (!profile) throw new Error('User must have a profile to comment.');

      return getApiClient().create({
        collection: 'comments',
        data: {
          content: data.content,
          parent: extractID(data.parent),
          repliedTo: extractID(data.repliedTo),
          post: postID,
          author: { relationTo: profile.relationTo, value: extractID(profile.value) },
        },
      });
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL }),
        client.invalidateQueries({ queryKey: ['comments'] }),
      ]);
    },
  });
}

export function createDeleteCommentMutationOptions(commentID: string) {
  return mutationOptions({
    mutationKey: ['delete', 'comment', commentID],
    meta: { errorMessage: (err) => extractErrorMessage(err) },
    mutationFn: async () => {
      return getApiClient().deleteByID({ collection: 'comments', id: commentID });
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: QUERY_KEYS.POSTS.ALL }),
        client.invalidateQueries({ queryKey: ['comments'] }),
      ]);
    },
  });
}
