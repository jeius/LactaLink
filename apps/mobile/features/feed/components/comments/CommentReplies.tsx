import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ReplyArgs, UseInfiniteCommentsReturn } from '@/features/feed/lib/types';
import { Comment } from '@lactalink/types/payload-generated-types';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import CommentsSheetItem from './CommentsSheetItem';

interface CommentRepliesProps {
  comment: Comment;
  postsQueryKey: QueryKey;
  onReply?: (args: ReplyArgs) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  query: UseInfiniteCommentsReturn;
}

const REPLIES_LIMIT = 4;

export default function CommentReplies({
  comment,
  postsQueryKey,
  onReply,
  query,
  open: viewMore,
  setOpen: setViewMore,
}: CommentRepliesProps) {
  const queryClient = useQueryClient();

  const { isFetchingNextPage, isLoading, hasNextPage, isFetching, isEnabled, ...repliesQuery } =
    query;

  const totalReplies = comment.repliesCount ?? 0;
  const viewedReplies = repliesQuery.data?.length ?? 0;
  const remainingReplies = Math.max(0, totalReplies - viewedReplies);
  const moreReplies =
    isEnabled && !hasNextPage ? remainingReplies : Math.min(REPLIES_LIMIT, remainingReplies);

  const createViewMoreLabel = () => {
    const getReplyText = (count: number) => (count === 1 ? 'reply' : 'replies');

    if (!viewMore) {
      const replies = viewedReplies || moreReplies;
      return `View ${replies} more ${getReplyText(replies)}`;
    }

    if (viewMore && !hasNextPage) {
      return `Hide ${getReplyText(viewedReplies)}`;
    }

    return `View ${moreReplies} more ${getReplyText(moreReplies)}`;
  };

  const handleViewMoreReplies = () => {
    if (!viewMore) {
      setViewMore(true);
      repliesQuery.refetch();
    } else if (hasNextPage && !isFetchingNextPage) {
      repliesQuery.fetchNextPage();
    } else {
      setViewMore(false);
      queryClient.cancelQueries({ queryKey: repliesQuery.queryKey });
    }
  };

  if (totalReplies === 0) return null;

  return (
    <>
      {viewMore && (repliesQuery.data?.length ?? 0) > 0 && (
        <VStack space="md" className="mt-2 items-stretch gap-3 py-1">
          {repliesQuery.data.map((reply) => (
            <CommentsSheetItem
              key={reply.id}
              comment={reply}
              queryKey={repliesQuery.queryKey}
              postsQueryKey={postsQueryKey}
              onReply={onReply}
            />
          ))}
        </VStack>
      )}

      <HStack className="items-center">
        <Divider orientation="horizontal" className="mr-2 w-8" />
        {isLoading || isFetchingNextPage ? (
          <>
            <Spinner size="small" variant="default" className="mr-2" />
            <Text size="sm" className="shrink font-JakartaSemiBold">
              Loading replies...
            </Text>
          </>
        ) : (
          <Pressable className="flex-row p-1" onPress={handleViewMoreReplies}>
            {isFetching && <Spinner size="small" variant="default" className="mr-2" />}
            <Text size="sm" className="shrink font-JakartaSemiBold">
              {createViewMoreLabel()}
            </Text>
          </Pressable>
        )}
      </HStack>
    </>
  );
}
