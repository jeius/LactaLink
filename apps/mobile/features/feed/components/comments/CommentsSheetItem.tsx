import { useDeleteCommentMutation } from '@/features/feed/hooks/useDeleteCommentMutation';
import { useLikeInteraction } from '@/features/feed/hooks/useLikeInteraction';
import { DeleteCommentPayload, ReplyArgs } from '@/features/feed/lib/types';
import { isTempID } from '@/lib/utils/tempID';
import { Comment } from '@lactalink/types/payload-generated-types';
import { useRecyclingState } from '@shopify/flash-list';
import { QueryKey } from '@tanstack/react-query';
import React from 'react';
import { createRepliesInfiniteOptions } from '../../lib/queryOptions/repliesInfiniteOptions';
import CommentItem from './CommentItem';
import CommentItemActions from './CommentItemActions';
import CommentLikeButton from './CommentLikeButton';
import CommentReplies from './CommentReplies';

interface CommentsSheetItemProps {
  comment: Comment;
  queryKey: QueryKey;
  onReply?: (args: ReplyArgs) => void;
}

export default function CommentsSheetItem({ comment, queryKey, onReply }: CommentsSheetItemProps) {
  const [openModal, setOpenModal] = useRecyclingState(false, [comment.id]);

  const [viewMore, setViewMore] = useRecyclingState(false, [comment.id]);

  const repliesInfiniteOptions = createRepliesInfiniteOptions(comment.id, viewMore);
  const repliesQueryKey = repliesInfiniteOptions.queryKey;

  const { hasLiked, toggleLike } = useLikeInteraction(
    { relationTo: 'comments', value: comment },
    queryKey
  );

  const { mutate: deleteComment } = useDeleteCommentMutation(queryKey);

  const handleReplyPress = () => {
    onReply?.({
      comment,
      queryKey: repliesQueryKey,
      parentComment: comment,
    });
  };

  const handleDelete = (comment: Comment) => {
    const payload: DeleteCommentPayload = { ...comment, queryKey };
    deleteComment(payload);
  };

  return (
    <>
      <CommentItem
        comment={comment}
        isTemporary={isTempID(comment.id)}
        avatarSize={32}
        likeButton={<CommentLikeButton comment={comment} queryKey={queryKey} />}
        onReplyPress={handleReplyPress}
        onLongPress={() => setOpenModal(true)}
        replies={
          <CommentReplies
            comment={comment}
            onReply={onReply}
            open={viewMore}
            setOpen={setViewMore}
          />
        }
      />

      <CommentItemActions
        comment={comment}
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
