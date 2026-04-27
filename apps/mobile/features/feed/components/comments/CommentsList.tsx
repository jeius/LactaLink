import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { InfiniteFlashList, InfiniteFlashListProps } from '@/components/ui/list/InfiniteFlashList';
import { Skeleton } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import { Comment } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { useRecyclingState } from '@shopify/flash-list';
import { useState } from 'react';
import { Text } from 'react-native';
import { useAddCommentMutation, useDeleteCommentMutation } from '../../hooks/mutations';
import { useInfiniteComments } from '../../hooks/queries';
import { useLikeInteraction } from '../../hooks/useLikeInteraction';
import { ReplyArgs } from '../../lib/types';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';
import CommentItemActions from './CommentItemActions';
import CommentLikeButton from './CommentLikeButton';
import CommentReplies from './CommentReplies';

const PLACEHOLDER_COMMENTS = generatePlaceHoldersWithID(10, {} as Comment);

interface CommentsListProps extends Pick<
  InfiniteFlashListProps<Comment>,
  'ListHeaderComponent' | 'headerClassName'
> {
  postID: string;
}

export default function CommentsList({ postID, ...props }: CommentsListProps) {
  const { data: comments, isRefetching, refetch, ...commentsQuery } = useInfiniteComments(postID);

  const [inputHeight, setInputHeight] = useState(0);
  const [repliedComment, setRepliedComment] = useState<Comment | null>(null);
  const [parentComment, setParentComment] = useState<Comment | null>(null);

  const { mutateAsync: addComment, isPending: isSubmittingComment } = useAddCommentMutation(postID);

  const handleReset = () => {
    setRepliedComment(null);
    setParentComment(null);
  };

  const handleSubmit = async (value: string) => {
    await addComment({ content: value, parent: parentComment, repliedTo: repliedComment });
    handleReset();
  };

  const handleReply = ({ comment, parentComment }: ReplyArgs) => {
    setRepliedComment(comment);
    setParentComment(parentComment);
  };

  return (
    <Box className="flex-1">
      <InfiniteFlashList
        {...commentsQuery}
        {...props}
        gap={16}
        data={commentsQuery.isLoading ? PLACEHOLDER_COMMENTS : (comments ?? [])}
        keyExtractor={listKeyExtractor}
        contentContainerClassName="px-4 py-2 grow"
        contentContainerStyle={{ paddingBottom: inputHeight + 8 }}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={<ListEmpty />}
        renderItem={({ item }) =>
          isPlaceHolderData(item) ? (
            <CommentItemPlaceholder />
          ) : (
            <CommentsListItem comment={item} onReply={handleReply} />
          )
        }
      />

      <CommentInput
        onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
        isSubmitting={isSubmittingComment}
        onSubmit={handleSubmit}
        onReplyCancel={handleReset}
        replyToAuthor={repliedComment?.author}
      />
    </Box>
  );
}

function ListEmpty() {
  return (
    <Box className="flex-1 items-center justify-center py-8">
      <Text className="text-center text-typography-700">
        No comments yet. Be the first to comment!
      </Text>
    </Box>
  );
}

function CommentItemPlaceholder() {
  return (
    <HStack space="sm">
      <Skeleton variant="circular" style={{ width: 32, height: 32 }} />
      <VStack space="xs" className="h-32 flex-1">
        <Skeleton variant="sharp" className="mb-1 h-4 w-28" />
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} variant="sharp" className="h-5 w-full" />
        ))}
        <Skeleton variant="sharp" className="mt-1 h-4 w-12" />
      </VStack>
    </HStack>
  );
}

interface CommentsSheetItemProps {
  comment: Comment;
  onReply?: (args: ReplyArgs) => void;
}

function CommentsListItem({ comment, onReply }: CommentsSheetItemProps) {
  const [openModal, setOpenModal] = useRecyclingState(false, [comment.id]);
  const [viewMore, setViewMore] = useRecyclingState(false, [comment.id]);

  const likeInteraction = useLikeInteraction({ relationTo: 'comments', value: comment });
  const { hasLiked, toggleLike } = likeInteraction;

  const { mutate: deleteComment, isPending: isDeleting } = useDeleteCommentMutation(comment.id);

  const handleReply = () => {
    onReply?.({ comment, parentComment: comment });
  };

  return (
    <>
      <CommentItem
        comment={comment}
        isTemporary={isDeleting}
        avatarSize={32}
        likeButton={<CommentLikeButton {...likeInteraction} />}
        onReplyPress={handleReply}
        onLongPress={() => setOpenModal(true)}
        replies={
          <CommentReplies
            comment={comment}
            onReply={onReply}
            isExpanded={viewMore}
            setExpanded={setViewMore}
          />
        }
      />

      <CommentItemActions
        comment={comment}
        open={openModal}
        hasLiked={hasLiked}
        setOpen={setOpenModal}
        onReply={handleReply}
        onLike={toggleLike}
        onDelete={() => deleteComment()}
      />
    </>
  );
}
