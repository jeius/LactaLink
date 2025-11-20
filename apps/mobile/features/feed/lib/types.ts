import { InfiniteDataMap } from '@/lib/types';
import { Comment, Post } from '@lactalink/types/payload-generated-types';
import { Where } from '@lactalink/types/payload-types';
import { DefinedUseInfiniteQueryResult, QueryKey } from '@tanstack/react-query';

export type UseInfiniteCommentsReturn = Omit<
  DefinedUseInfiniteQueryResult<InfiniteDataMap<Comment, unknown>>,
  'data'
> & {
  queryKey: QueryKey;
  data: Comment[];
  paginatedData: InfiniteDataMap<Comment, unknown>;
};

export interface Config {
  enabled?: boolean;
  where?: Where;
  limit?: number;
  sort?: string;
  depth?: number;
}

export type ReplyArgs = {
  comment: Comment;
  parentComment: Comment;
  queryKey: QueryKey;
};

// Improved: Separate metadata from data using a discriminated union approach
export type CommentMutationPayload = {
  comment: Comment;
  queryKey: QueryKey;
};

export type CommentPayload = Comment & {
  queryKey: QueryKey;
};

export type DeleteCommentPayload = CommentPayload;

export interface CommentMutationContext<T> {
  previousComments: T | undefined;
  previousPosts: T | undefined;
  previousParentComments?: T | undefined;
}

export type LikableRelation = {
  relationTo: 'comments' | 'posts';
  value: Post | Comment;
};

export type LikeMutationContext = {
  previousData: InfiniteDataMap<Post | Comment> | undefined;
};
