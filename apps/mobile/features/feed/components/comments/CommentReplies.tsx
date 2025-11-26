import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DeleteCommentPayload, ReplyArgs } from '@/features/feed/lib/types';
import { isTempID } from '@/lib/utils/tempID';
import { Comment } from '@lactalink/types/payload-generated-types';
import { useRecyclingState } from '@shopify/flash-list';
import { QueryKey, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useDeleteCommentMutation } from '../../hooks/useDeleteCommentMutation';
import { useLikeInteraction } from '../../hooks/useLikeInteraction';
import { REPLIES_LIMIT } from '../../lib/constants';
import { createRepliesInfiniteOptions } from '../../lib/queryOptions/repliesInfiniteOptions';
import CommentItem from './CommentItem';
import CommentItemActions from './CommentItemActions';
import CommentLikeButton from './CommentLikeButton';

interface CommentRepliesProps {
  comment: Comment;
  onReply?: (args: ReplyArgs) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function CommentReplies({
  comment,
  onReply,
  open: viewMore,
  setOpen: setViewMore,
}: CommentRepliesProps) {
  const queryClient = useQueryClient();

  const repliesInfiniteOptions = useMemo(
    () => createRepliesInfiniteOptions(comment.id, viewMore),
    [comment.id, viewMore]
  );
  const repliesQueryKey = repliesInfiniteOptions.queryKey;

  const {
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    isFetching,
    isEnabled,
    data,
    ...repliesQuery
  } = useInfiniteQuery(repliesInfiniteOptions);

  const replies = useMemo(() => data?.pages.flatMap((p) => Array.from(p.docs.values())), [data]);

  const totalReplies = comment.repliesCount ?? 0;
  const viewedReplies = replies?.length ?? 0;
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
      queryClient.cancelQueries(repliesInfiniteOptions);
    }
  };

  if (totalReplies === 0) return null;

  return (
    <>
      {viewMore && (replies?.length ?? 0) > 0 && (
        <VStack space="md" className="mt-2 items-stretch gap-3 py-1">
          {replies?.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              queryKey={repliesQueryKey}
              parentComment={comment}
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

interface ReplyItemProps {
  reply: Comment;
  queryKey: QueryKey;
  parentComment: Comment;
  onReply?: (args: ReplyArgs) => void;
}

function ReplyItem({ reply, queryKey, onReply, parentComment }: ReplyItemProps) {
  const [openModal, setOpenModal] = useRecyclingState(false, [reply.id]);

  const { hasLiked, toggleLike } = useLikeInteraction(
    { relationTo: 'comments', value: reply },
    queryKey
  );

  const { mutate: deleteComment } = useDeleteCommentMutation(queryKey);

  const handleReplyPress = () => {
    onReply?.({
      comment: reply,
      queryKey: queryKey,
      parentComment: parentComment,
    });
  };

  const handleDelete = (comment: Comment) => {
    const payload: DeleteCommentPayload = { ...comment, queryKey };
    deleteComment(payload);
  };

  return (
    <>
      <CommentItem
        comment={reply}
        isTemporary={isTempID(reply.id)}
        avatarSize={24}
        likeButton={<CommentLikeButton comment={reply} queryKey={queryKey} />}
        onReplyPress={handleReplyPress}
        onLongPress={() => setOpenModal(true)}
      />

      <CommentItemActions
        comment={reply}
        open={openModal}
        hasLiked={hasLiked}
        setOpen={setOpenModal}
        onReply={handleReplyPress}
        onLike={toggleLike}
        onDelete={handleDelete}
      />
    </>
  );
}
