import { NoData } from '@/components/NoData';
import {
  BottomSheet,
  BottomSheetDragIndicator,
  BottomSheetFlashList,
  BottomSheetPortal,
} from '@/components/ui/bottom-sheet';
import { BottomSheetPortalProps, BottomSheetProps } from '@/components/ui/bottom-sheet/types';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { VStack } from '@/components/ui/vstack';
import { useAddCommentMutation } from '@/features/feed/hooks/useAddCommentMutation';
import { useInfiniteComments } from '@/features/feed/hooks/useInfiniteComments';
import { QUERY_KEYS } from '@/lib/constants';
import { getMeUser } from '@/lib/stores/meUserStore';
import { Comment, Post } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { QueryKey } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import React, { useState } from 'react';
import { CommentPayload, ReplyArgs } from '../lib/types';
import CommentInput from './CommentInput';
import CommentsSheetItem from './CommentsSheetItem';

interface CommentsSheetProps
  extends BottomSheetProps,
    Pick<
      BottomSheetPortalProps,
      | 'snapPoints'
      | 'enableDynamicSizing'
      | 'backdropComponent'
      | 'animatedPosition'
      | 'animatedIndex'
      | 'topInset'
      | 'bottomInset'
    > {
  post: Pick<Post, 'id' | 'comments'>;
}

const PLACEHOLDER_COMMENTS = generatePlaceHoldersWithID(10, {} as Comment);

export default function CommentsSheet({
  post,
  snapPoints,
  enableDynamicSizing = false,
  backdropComponent,
  topInset,
  bottomInset = 0,
  ...props
}: CommentsSheetProps) {
  const postsQueryKey = QUERY_KEYS.POSTS.INFINITE;
  const { queryKey: commentsQueryKey, ...query } = useInfiniteComments(undefined, {
    limit: 10,
    where: {
      and: [{ post: { equals: post.id } }, { parent: { exists: false } }],
    },
  });

  const [inputHeight, setInputHeight] = useState(0);

  const [repliedComment, setRepliedComment] = useState<Comment | null>(null);
  const [parentComment, setParentComment] = useState<Comment | null>(null);
  const [invalidateQueryKey, setInvalidateQueryKey] = useState<QueryKey>(commentsQueryKey);

  const { mutate: addComment } = useAddCommentMutation(postsQueryKey, commentsQueryKey);

  const handleReset = () => {
    setRepliedComment(null);
    setParentComment(null);
    setInvalidateQueryKey(commentsQueryKey);
  };

  const handleSubmit = (value: string) => {
    const meUser = getMeUser();
    const meProfile = meUser?.profile;
    if (!meProfile) return;

    const payload: CommentPayload = {
      id: `temp-${randomUUID()}`,
      post: repliedComment?.post ?? parentComment?.post ?? post.id,
      repliedTo: repliedComment ?? undefined,
      parent: parentComment ?? undefined,
      content: value,
      queryKey: invalidateQueryKey,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      author: meProfile,
    };

    addComment(payload);
    handleReset();
  };

  const handleReply = ({ comment, queryKey, parentComment }: ReplyArgs) => {
    setRepliedComment(comment);
    setInvalidateQueryKey(queryKey);
    setParentComment(parentComment);
  };

  return (
    <>
      <BottomSheet {...props}>
        <BottomSheetPortal
          snapPoints={snapPoints}
          handleComponent={BottomSheetDragIndicator}
          backdropComponent={backdropComponent}
          enableDynamicSizing={enableDynamicSizing}
          enableContentPanningGesture
          topInset={topInset}
        >
          <BottomSheetFlashList
            data={query.isLoading ? PLACEHOLDER_COMMENTS : (query.data ?? [])}
            keyExtractor={listKeyExtractor}
            className="flex-1"
            contentContainerClassName="px-4 py-2 flex-col items-stretch grow"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: inputHeight + 8 }}
            ItemSeparatorComponent={() => <Box className="h-4" />}
            ListEmptyComponent={() => <NoData title="No one has commented yet" />}
            ListFooterComponent={() => query.isFetchingNextPage && <Spinner className="my-4" />}
            onEndReachedThreshold={0.35}
            onEndReached={query.fetchNextPage}
            renderItem={({ item }) =>
              isPlaceHolderData(item) ? (
                <CommentItemPlaceholder />
              ) : (
                <CommentsSheetItem
                  comment={item}
                  queryKey={commentsQueryKey}
                  postsQueryKey={postsQueryKey}
                  onReply={handleReply}
                />
              )
            }
          />
        </BottomSheetPortal>
      </BottomSheet>

      <CommentInput
        onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
        style={{ paddingBottom: bottomInset + 8 }}
        onSubmit={handleSubmit}
        onReplyCancel={handleReset}
        replyToAuthor={repliedComment?.author}
      />
    </>
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
