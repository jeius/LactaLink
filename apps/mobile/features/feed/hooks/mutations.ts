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
import {
  createDeletePostMutationOptions,
  createNewPostMutationOptions,
  createUpdatePostMutationOptions,
} from '../lib/mutationOptions/posts';
import { LikableRelation } from '../lib/types';

// #region Post Mutations
export function useCreatePostMutation() {
  return useMutation(createNewPostMutationOptions());
}

export function useDeletePostMutation(postID: string) {
  return useMutation(createDeletePostMutationOptions(postID));
}

export function useUpdatePostMutation(postID: string) {
  return useMutation(createUpdatePostMutationOptions(postID));
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
