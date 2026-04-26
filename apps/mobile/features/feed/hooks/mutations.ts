import { useMutation } from '@tanstack/react-query';
import { createDeletePostMutationOptions } from '../lib/mutationOptions/posts';

export function useDeletePostMutation(postID: string) {
  return useMutation(createDeletePostMutationOptions(postID));
}
