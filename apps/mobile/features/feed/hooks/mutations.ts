import { useMeUser } from '@/hooks/auth/useAuth';
import { useMutation } from '@tanstack/react-query';
import {
  createDeleteCommentMutationOptions,
  createNewCommentMutationOptions,
} from '../lib/mutationOptions/comments';
import {
  createAddLikeMutationOptions,
  createDeleteLikeMutationOptions,
} from '../lib/mutationOptions/likes';
import { createDeletePostMutationOptions } from '../lib/mutationOptions/posts';
import { LikableRelation } from '../lib/types';

// #region Post Mutations
export function useDeletePostMutation(postID: string) {
  return useMutation(createDeletePostMutationOptions(postID));
}
// #endregion

// #region Comment Mutations
export function useAddCommentMutation(postID: string) {
  return useMutation(createNewCommentMutationOptions(postID));
}

export function useDeleteCommentMutation(commentID: string) {
  return useMutation(createDeleteCommentMutationOptions(commentID));
}
// #endregion

// #region Like Mutations
export function useAddLikeMutation(doc: LikableRelation) {
  const { data: user } = useMeUser();
  return useMutation(createAddLikeMutationOptions(doc, user));
}

export function useDeleteLikeMutation(doc: LikableRelation) {
  return useMutation(createDeleteLikeMutationOptions(doc));
}
// #endregion
