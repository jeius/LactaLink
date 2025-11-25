import { useDeleteCommentMutation } from '@/features/feed/hooks/useDeleteCommentMutation';
import { useInfiniteComments } from '@/features/feed/hooks/useInfiniteComments';
import { useLikeInteraction } from '@/features/feed/hooks/useLikeInteraction';
import { DeleteCommentPayload, ReplyArgs } from '@/features/feed/lib/types';
import { Comment } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { useRecyclingState } from '@shopify/flash-list';
import { QueryKey } from '@tanstack/react-query';
import React from 'react';
import CommentItem from './CommentItem';
import CommentItemActions from './CommentItemActions';
import CommentLikeButton from './CommentLikeButton';
import CommentReplies from './CommentReplies';

interface CommentsSheetItemProps {
  comment: Comment;
  queryKey: QueryKey;
  postsQueryKey: QueryKey;
  onReply?: (args: ReplyArgs) => void;
}

const REPLIES_LIMIT = 4;

export default function CommentsSheetItem({
  comment,
  queryKey,
  postsQueryKey,
  onReply,
}: CommentsSheetItemProps) {
  const [openModal, setOpenModal] = useRecyclingState(false, [comment.id]);

  const hasParent = !!comment.parent;
  const avatarSize = hasParent ? 24 : 32;
  const isTemporary = comment.id.startsWith('temp-');

  const [viewMore, setViewMore] = useRecyclingState(false, [comment.id]);
  const sort = hasParent ? '-createdAt' : 'createdAt';

  const repliesQuery = useInfiniteComments(undefined, {
    enabled: viewMore,
    limit: REPLIES_LIMIT,
    sort,
    where: {
      and: [
        { post: { equals: extractID(comment.post) } },
        { parent: { equals: extractID(comment) } },
      ],
    },
  });

  const { hasLiked, toggleLike } = useLikeInteraction(
    { relationTo: 'comments', value: comment },
    queryKey
  );

  const { mutate: deleteComment } = useDeleteCommentMutation(postsQueryKey, queryKey);

  const handleReplyPress = () => {
    const parent = extractCollection(comment.parent);
    onReply?.({
      comment,
      queryKey: parent ? queryKey : repliesQuery.queryKey,
      parentComment: parent ?? comment,
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
        queryKey={queryKey}
        isTemporary={isTemporary}
        avatarSize={avatarSize}
        likeButton={<CommentLikeButton comment={comment} queryKey={queryKey} />}
        replies={
          <CommentReplies
            comment={comment}
            postsQueryKey={postsQueryKey}
            onReply={onReply}
            open={viewMore}
            setOpen={setViewMore}
            query={repliesQuery}
          />
        }
        onReplyPress={handleReplyPress}
        onLongPress={() => setOpenModal(true)}
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
