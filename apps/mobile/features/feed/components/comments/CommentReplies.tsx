import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { FlashList } from '@/components/ui/FlashList';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { ReplyArgs } from '@/features/feed/lib/types';
import { Comment } from '@lactalink/types/payload-generated-types';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { useRecyclingState } from '@shopify/flash-list';
import { useDeleteCommentMutation } from '../../hooks/mutations';
import { useInfiniteReplies } from '../../hooks/queries';
import { useLikeInteraction } from '../../hooks/useLikeInteraction';
import { REPLIES_LIMIT } from '../../lib/constants';
import CommentItem from './CommentItem';
import CommentItemActions from './CommentItemActions';
import CommentLikeButton from './CommentLikeButton';

interface CommentRepliesProps {
  comment: Comment;
  onReply?: (args: Omit<ReplyArgs, 'queryKey'>) => void;
  isExpanded: boolean;
  setExpanded: (open: boolean) => void;
}

export default function CommentReplies({
  comment,
  onReply,
  isExpanded: viewMore,
  setExpanded: setViewMore,
}: CommentRepliesProps) {
  const {
    isFetchingNextPage,
    isLoading,
    hasNextPage,
    isFetching,
    isEnabled,
    data: replies,
    ...repliesQuery
  } = useInfiniteReplies(comment, viewMore);

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
    }
  };

  if (totalReplies === 0) return null;

  return (
    <>
      {viewMore && (replies?.length ?? 0) > 0 && (
        <FlashList
          data={replies}
          keyExtractor={listKeyExtractor}
          className="mt-2"
          contentContainerClassName="py-1"
          ItemSeparatorComponent={() => <Box className="h-3" />}
          renderItem={({ item }) => (
            <ReplyItem reply={item} parentComment={comment} onReply={onReply} />
          )}
        />
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
  parentComment: Comment;
  onReply?: (args: Omit<ReplyArgs, 'queryKey'>) => void;
}

function ReplyItem({ reply, onReply, parentComment }: ReplyItemProps) {
  const [openModal, setOpenModal] = useRecyclingState(false, [reply.id]);

  const likeInteraction = useLikeInteraction({ relationTo: 'comments', value: reply });
  const { hasLiked, toggleLike } = likeInteraction;

  const { mutate: deleteComment, isPending: isDeleting } = useDeleteCommentMutation(reply.id);

  const handleReplyPress = () => {
    onReply?.({ comment: reply, parentComment: parentComment });
  };

  return (
    <>
      <CommentItem
        comment={reply}
        isTemporary={isDeleting}
        avatarSize={24}
        likeButton={<CommentLikeButton {...likeInteraction} />}
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
        onDelete={() => deleteComment()}
      />
    </>
  );
}
