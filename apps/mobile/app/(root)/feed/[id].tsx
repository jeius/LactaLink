import { AnimatedPressable } from '@/components/animated/pressable';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { TruncatedText } from '@/components/ui/truncated-text';
import { VStack } from '@/components/ui/vstack';
import CommentInput from '@/features/feed/components/comments/CommentInput';
import CommentItemPlaceholder from '@/features/feed/components/comments/CommentItemPlaceholder';
import CommentsListItem from '@/features/feed/components/comments/CommentsListItem';
import PostAuthor from '@/features/feed/components/post-item/PostAuthor';
import PostMedia from '@/features/feed/components/post-item/PostMedia';
import PostShare from '@/features/feed/components/post-item/PostShare';
import PostStats from '@/features/feed/components/post-item/PostStats';
import { useAddCommentMutation } from '@/features/feed/hooks/useAddCommentMutation';
import { createCommentsInfiniteOptions } from '@/features/feed/lib/queryOptions/commentsInfiniteOptions';
import { createPostQueryOptions } from '@/features/feed/lib/queryOptions/postQueryOptions';
import { postsInfiniteOptions } from '@/features/feed/lib/queryOptions/postsInfiniteOptions';
import { CommentPayload, FeedSearchParams, ReplyArgs } from '@/features/feed/lib/types';
import { getMeUser } from '@/lib/stores/meUserStore';
import { InfiniteDataMap } from '@/lib/types';
import { createTempID } from '@/lib/utils/tempID';
import { Comment, Post } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractDisplayName, listKeyExtractor } from '@lactalink/utilities/extractors';
import { FlashList } from '@shopify/flash-list';
import { QueryKey, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MessageSquareIcon, XIcon } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';

type SearchParams = FeedSearchParams & { id: string };

const PLACEHOLDER_COMMENTS = generatePlaceHoldersWithID(10, {} as Comment);

export default function Feed() {
  const { id } = useLocalSearchParams<SearchParams>();

  const { data: mappedData } = useInfiniteQuery(postsInfiniteOptions);

  const initialData = useMemo(() => getPost(id, mappedData), [id, mappedData]);
  const postQueryOptions = createPostQueryOptions(id, initialData);
  const { data: post, isLoading } = useQuery(postQueryOptions);

  if (isLoading || !post) return <LoadingSpinner />;

  return (
    <SafeArea className="items-stretch justify-start">
      <Header {...post} />
      <Content {...post} />
    </SafeArea>
  );
}

function Header(post: Post) {
  const authorName = extractDisplayName({ profile: post.author });
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };
  return (
    <HStack space="sm" className="items-center px-4 py-2">
      <AnimatedPressable onPress={handleBackPress} className={'overflow-hidden rounded-full p-2'}>
        <Icon as={XIcon} size="xl" />
      </AnimatedPressable>

      <Text bold size="lg" numberOfLines={1} className="flex-1 text-center">
        {authorName}
      </Text>

      <AnimatedPressable className={'overflow-hidden rounded-full p-2'}>
        <Icon as={MessageSquareIcon} size="xl" />
      </AnimatedPressable>
    </HStack>
  );
}

function ListHeader(post: Post) {
  const { author, createdAt, title, content, attachments, sharedFrom, id } = post;

  const hasAttachments = attachments && attachments.length > 0;
  const titleInitialLines = hasAttachments ? 2 : 3;
  const contentInitialLines = hasAttachments ? 2 : 5;
  return (
    <>
      <VStack space="sm" className="p-3">
        <PostAuthor author={author} createdAt={createdAt} />

        <VStack className="mt-2 items-stretch">
          <TruncatedText
            initialLines={titleInitialLines}
            size="lg"
            bold
            className="grow"
            recyclingKey={`title-${id}`}
          >
            {title}
          </TruncatedText>
          {content && (
            <TruncatedText
              initialLines={contentInitialLines}
              className="mt-2 grow"
              recyclingKey={`content-${id}`}
            >
              {content}
            </TruncatedText>
          )}
        </VStack>
      </VStack>

      {attachments && attachments.length > 0 && <PostMedia attachments={attachments} />}

      {sharedFrom && <PostShare sharedFrom={sharedFrom} />}

      <PostStats post={post} disableCommentPress />

      <Divider orientation="horizontal" />
    </>
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

function Content({
  onRefresh,
  refreshing = false,
  ...post
}: Post & { onRefresh?: () => void; refreshing?: boolean }) {
  const commentsQueryOptions = createCommentsInfiniteOptions(post.id);
  const commentsQueryKey = commentsQueryOptions.queryKey;
  const { isFetchingNextPage, ...commentsQuery } = useInfiniteQuery(commentsQueryOptions);

  const comments = useMemo(
    () => commentsQuery.data?.pages.flatMap((p) => Array.from(p.docs.values())),
    [commentsQuery.data]
  );

  const isRefreshing = refreshing || commentsQuery.isRefetching;

  const [inputHeight, setInputHeight] = useState(0);

  const [repliedComment, setRepliedComment] = useState<Comment | null>(null);
  const [parentComment, setParentComment] = useState<Comment | null>(null);
  const [invalidateQueryKey, setInvalidateQueryKey] = useState<QueryKey>(commentsQueryKey);

  const { mutate: addComment } = useAddCommentMutation(post.id);

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
      id: createTempID(),
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

  const handleRefresh = () => {
    commentsQuery.refetch();
    onRefresh?.();
  };

  return (
    <Box className="flex-1">
      <FlashList
        data={commentsQuery.isLoading ? PLACEHOLDER_COMMENTS : comments || []}
        keyExtractor={listKeyExtractor}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Box className="h-4" />}
        ListHeaderComponent={() => <ListHeader {...post} />}
        ListFooterComponent={() => isFetchingNextPage && <Spinner size={'small'} />}
        ListEmptyComponent={ListEmpty}
        ListHeaderComponentStyle={{ marginBottom: 16, marginHorizontal: -16 }}
        ListFooterComponentStyle={{ marginVertical: 8 }}
        contentContainerStyle={{ paddingBottom: inputHeight + 8, paddingHorizontal: 16 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        onEndReached={commentsQuery.fetchNextPage}
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
        className="bg-background-50"
        onSubmit={handleSubmit}
        onReplyCancel={handleReset}
        replyToAuthor={repliedComment?.author}
      />
    </Box>
  );
}

function getPost(id: string, data?: InfiniteDataMap<Post>) {
  if (!data) return;
  for (const page of data.pages) {
    return page.docs.get(id);
  }
  return;
}
