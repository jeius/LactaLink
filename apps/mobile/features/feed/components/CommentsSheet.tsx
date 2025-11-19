import { AnimatedPressable } from '@/components/animated/pressable';
import { ProfileAvatar } from '@/components/Avatar';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import { ActionModal } from '@/components/modals';
import { NoData } from '@/components/NoData';
import {
  BottomSheet,
  BottomSheetBackdrop,
  BottomSheetContent,
  BottomSheetDragIndicator,
  BottomSheetFlashList,
  BottomSheetItem,
  BottomSheetModalPortal,
  BottomSheetPortal,
} from '@/components/ui/bottom-sheet';
import { BottomSheetPortalProps, BottomSheetProps } from '@/components/ui/bottom-sheet/types';
import { Box, BoxProps } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Text, TextProps } from '@/components/ui/text';
import { TruncatedText } from '@/components/ui/truncated-text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useInfiniteComments } from '@/hooks/posts/useInfiniteComments';
import {
  useAddCommentMutation,
  useDeleteCommentMutation,
  useLikeInteraction,
} from '@/hooks/posts/useInteraction';
import { Comment, Post } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isEqualProfiles, isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection, extractID, listKeyExtractor } from '@lactalink/utilities/extractors';
import { formatNumberToShortenUnits, formatTimeToPastLabel } from '@lactalink/utilities/formatters';
import { isIndividual } from '@lactalink/utilities/type-guards';
import { useRecyclingState } from '@shopify/flash-list';
import { QueryKey } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { Link } from 'expo-router';
import isEqual from 'lodash/isEqual';
import {
  BadgeCheckIcon,
  HeartIcon,
  LucideIcon,
  LucideProps,
  PenIcon,
  SendIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react-native';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, TextInput, TextInputContentSizeChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

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

interface CommentStore {
  replyTo: Comment | null;
  parentComment: Comment | null;
  queryKey: QueryKey | null;

  rootQueryKey: QueryKey | null;
  actions: {
    setReplyTo: (comment: Comment | null) => void;
    setParentComment: (comment: Comment | null) => void;
    setQueryKey: (queryKey: QueryKey | null) => void;
    reset: () => void;
  };
}

interface CommentItemActionsProps {
  comment: Comment;
  commentsQueryKey: QueryKey;
  repliesQueryKey: QueryKey;
  open: boolean;
  setOpen: (open: boolean) => void;
}

type CommentAction = {
  label: string;
  icon: FC<LucideProps> | LucideIcon;
  action: () => void;
};

const useCommentStore = create<CommentStore>((set) => ({
  replyTo: null,
  parentComment: null,
  queryKey: null,
  rootQueryKey: null,
  actions: {
    setReplyTo: (comment) => set({ replyTo: comment || null }),
    setParentComment: (comment) => set({ parentComment: comment || null }),
    setQueryKey: (queryKey) => set({ queryKey }),
    reset: () => set({ replyTo: null, parentComment: null, queryKey: null }),
  },
}));

const PLACEHOLDER_COMMENTS = generatePlaceHoldersWithID(10, {} as Comment);
const INITIAL_COMMENT_LINES = 3;
const COMMENT_INPUT_HEIGHT = 40;
const MAX_COMMENT_INPUT_HEIGHT = 160;

const AnimatedInput = Animated.createAnimatedComponent(Input);

export default function CommentsSheet({
  post,
  snapPoints,
  enableDynamicSizing = false,
  backdropComponent,
  topInset,
  bottomInset = 0,
  ...props
}: CommentsSheetProps) {
  const query = useInfiniteComments(undefined, {
    limit: 10,
    where: {
      and: [{ post: { equals: post.id } }, { parent: { exists: false } }],
    },
  });

  const [inputHeight, setInputHeight] = useState(0);

  useEffect(() => {
    useCommentStore.getState().actions.reset();
    useCommentStore.setState({ rootQueryKey: query.queryKey });
  }, [post.id, query.queryKey]);

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
                <CommentItem comment={item} queryKey={query.queryKey} />
              )
            }
          />
        </BottomSheetPortal>
      </BottomSheet>

      <CommentInput
        post={post.id}
        queryKey={query.queryKey}
        onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
        style={{ paddingBottom: bottomInset + 8 }}
      />
    </>
  );
}

function CommentItem({ comment, queryKey }: { comment: Comment; queryKey: QueryKey }) {
  const [viewMore, setViewMore] = useRecyclingState(false, [comment.id]);
  const [openModal, setOpenModal] = useRecyclingState(false, [comment.id]);

  const hasParent = !!comment.parent;
  const avatarSize = hasParent ? 24 : 32;
  const isTemporary = comment.id.startsWith('temp-');

  const limit = 4;
  const sort = hasParent ? '-createdAt' : 'createdAt';

  const { isFetchingNextPage, isLoading, hasNextPage, isFetching, isEnabled, ...repliesQuery } =
    useInfiniteComments(undefined, {
      enabled: viewMore,
      limit: limit,
      sort: sort,
      where: {
        and: [
          { post: { equals: extractID(comment.post) } },
          { parent: { equals: extractID(comment) } },
        ],
      },
    });

  const { likesCount, hasLiked, toggleLike, isPending } = useLikeInteraction(
    { relationTo: 'comments', value: comment },
    queryKey
  );

  const totalReplies = comment.repliesCount ?? 0;
  const viewedReplies = repliesQuery.data?.length ?? 0;
  const remainingReplies = Math.max(0, totalReplies - viewedReplies);
  const moreReplies =
    isEnabled && !hasNextPage ? remainingReplies : Math.min(limit, remainingReplies);

  const viewMoreRepliesLabel = useMemo(() => {
    const getReply = (count: number) => (count === 1 ? 'reply' : 'replies');
    if (!viewMore) {
      const replies = viewedReplies || moreReplies;
      return `View ${replies} more ${getReply(replies)}`;
    } else if (viewMore && !hasNextPage) return `Hide ${getReply(viewedReplies)}`;
    else return `View ${moreReplies} more ${getReply(moreReplies)}`;
  }, [viewMore, hasNextPage, viewedReplies, moreReplies]);

  const handleViewMoreReplies = () => {
    if (!viewMore) {
      setViewMore(true);
      repliesQuery.refetch();
    } else if (hasNextPage && !isFetchingNextPage) repliesQuery.fetchNextPage();
    else setViewMore(false);
  };

  const handleReplyPress = () => {
    reply({ comment, rootQueryKey: queryKey, subQueryKey: repliesQuery.queryKey });
  };

  const handleLongPress = () => {
    setOpenModal(true);
    Keyboard.dismiss();
  };

  return (
    <>
      <Pressable onLongPress={handleLongPress}>
        <VStack space="xs" className="items-stretch" style={{ opacity: isTemporary ? 0.5 : 1 }}>
          <HStack space="sm" className="items-start">
            <ProfileAvatar
              profile={comment.author}
              style={{ width: avatarSize, height: avatarSize }}
              enablePress
            />

            <VStack space="xs" className="flex-1">
              <HStack space="sm" className="items-stretch">
                <VStack space="xs" className="flex-1 items-stretch">
                  <AuthorName author={comment.author} createdAt={comment.createdAt} />
                  <CommentContent
                    id={comment.id}
                    content={comment.content}
                    repliedTo={comment.repliedTo}
                  />
                  <AnimatedPressable className="self-start" hitSlop={8} onPress={handleReplyPress}>
                    <Text size="sm" className="font-JakartaSemiBold text-primary-700">
                      Reply
                    </Text>
                  </AnimatedPressable>
                </VStack>

                <VStack space="xs" className="items-center justify-start">
                  <VStack className="flex-1 items-center justify-center">
                    <Pressable className="p-1" onPress={() => toggleLike()} disabled={isPending}>
                      <Icon
                        as={HeartIcon}
                        size="xl"
                        className={hasLiked ? 'fill-primary-500 stroke-primary-600' : ''}
                      />
                    </Pressable>

                    <Text size="sm" bold>
                      {formatNumberToShortenUnits(likesCount)}
                    </Text>
                  </VStack>
                </VStack>
              </HStack>

              {totalReplies > 0 && (
                <>
                  {viewMore && repliesQuery.data?.length > 0 && (
                    <VStack space="md" className="mt-2 items-stretch gap-3 py-1">
                      {repliesQuery.data.map((reply) => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          queryKey={repliesQuery.queryKey}
                        />
                      ))}
                      {isFetching && !isFetchingNextPage && (
                        <Spinner
                          variant="default"
                          size={'small'}
                          className="self-start"
                          style={{ marginLeft: 32 }}
                        />
                      )}
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
                      <Pressable className="p-1" onPress={handleViewMoreReplies}>
                        <Text size="sm" className="shrink font-JakartaSemiBold">
                          {viewMoreRepliesLabel}
                        </Text>
                      </Pressable>
                    )}
                  </HStack>
                </>
              )}
            </VStack>
          </HStack>
        </VStack>
      </Pressable>
      <CommentItemActions
        comment={comment}
        commentsQueryKey={queryKey}
        repliesQueryKey={repliesQuery.queryKey}
        open={openModal}
        setOpen={setOpenModal}
      />
    </>
  );
}

function CommentItemActions({
  comment,
  commentsQueryKey,
  repliesQueryKey,
  open,
  setOpen,
}: CommentItemActionsProps) {
  const { data: meUser } = useMeUser();
  const insets = useSafeAreaInsets();

  const isAuthor = isEqualProfiles(meUser?.profile, comment.author);

  const { hasLiked, toggleLike } = useLikeInteraction(
    { relationTo: 'comments', value: comment },
    commentsQueryKey
  );

  const rootQueryKey = useCommentStore((state) => state.rootQueryKey) ?? [];

  const { deleteComment } = useDeleteCommentMutation(
    commentsQueryKey,
    !isEqual(rootQueryKey, commentsQueryKey) ? [rootQueryKey] : undefined
  );

  const handleReplyPress = () => {
    reply({
      comment,
      rootQueryKey: commentsQueryKey,
      subQueryKey: repliesQueryKey,
    });
  };

  const actions: CommentAction[] = [
    { label: hasLiked ? 'Unlike' : 'Like', icon: HeartIcon, action: toggleLike },
    { label: 'Reply', icon: SendIcon, action: handleReplyPress },
  ];

  if (isAuthor) {
    actions.push({ label: 'Edit', icon: PenIcon, action: () => {} });
  }

  const dismiss = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <BottomSheet open={open} setOpen={setOpen}>
      <BottomSheetModalPortal
        enableDynamicSizing
        handleComponent={BottomSheetDragIndicator}
        backdropComponent={BottomSheetBackdrop}
      >
        <BottomSheetContent
          className="flex-col items-stretch bg-background-0"
          style={{ paddingBottom: insets.bottom }}
        >
          {actions.map(({ label, icon, action }, idx) => (
            <BottomSheetItem key={`${label}-${idx}`} onPress={action}>
              <HStack space="md" className="items-center px-4 py-3">
                <Icon as={icon} />
                <Text className="font-JakartaMedium">{label}</Text>
              </HStack>
            </BottomSheetItem>
          ))}

          {isAuthor && (
            <>
              <Divider className="my-2" />
              <ActionModal
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
                className="mx-2"
                confirmLabel="Delete"
                action="negative"
                triggerLabel="Delete"
                triggerIcon={Trash2Icon}
                onConfirm={() => {
                  dismiss();
                  deleteComment(comment);
                }}
              />
            </>
          )}
        </BottomSheetContent>
      </BottomSheetModalPortal>
    </BottomSheet>
  );
}

function AuthorName({
  author,
  createdAt,
  size = 'sm',
}: Pick<Comment, 'author' | 'createdAt'> & Pick<TextProps, 'size'>) {
  const authorDoc = extractCollection(author.value);
  const isVerified = authorDoc && isIndividual(authorDoc) && authorDoc.isVerified;

  return (
    <HStack space="xs" className="flex-row items-center">
      <NameLink {...author} size={size} />

      {isVerified && <Icon as={BadgeCheckIcon} className="fill-info-500 stroke-info-0" />}

      <Text size={size} className="text-typography-700">
        {formatTimeToPastLabel(createdAt)}
      </Text>
    </HStack>
  );
}

function CommentContent({
  content,
  size,
  repliedTo,
  id,
}: Pick<Comment, 'id' | 'content' | 'repliedTo'> & Pick<TextProps, 'size'>) {
  const [pressed, setPressed] = useRecyclingState(false, [id]);

  const authorReplied = extractCollection(repliedTo)?.author;
  const authorRepliedFullname =
    extractCollection(authorReplied?.value)?.displayName || 'Unknown User';
  const authorID = extractID(authorReplied?.value);
  const authorSlug = authorReplied?.relationTo;
  return (
    <TruncatedText
      size={size}
      className="grow"
      initialLines={INITIAL_COMMENT_LINES}
      recyclingKey={id}
    >
      {authorID && authorSlug && (
        <Link asChild push href={`/profile/${authorSlug}/${authorID}`}>
          <Text
            size={size}
            bold
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-primary-500"
            underline={pressed}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
          >
            @{authorRepliedFullname}
            {'  '}
          </Text>
        </Link>
      )}
      {content}
    </TruncatedText>
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

function CommentInput({
  style,
  onLayout,
  queryKey: rootQueryKey,
  post,
}: Pick<BoxProps, 'style' | 'onLayout'> & {
  onSubmit?: (value: string) => void;
  queryKey: QueryKey;
  post: string;
}) {
  const { data: meUser } = useMeUser();
  const meProfile = meUser?.profile;

  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState('');

  const replyTo = useCommentStore((state) => state.replyTo);
  const { reset } = useCommentStore((state) => state.actions);

  const { addComment } = useAddCommentMutation(rootQueryKey);

  const replyToAuthor = replyTo ? replyTo.author : null;

  const animatedHeight = useSharedValue(COMMENT_INPUT_HEIGHT);
  const animatedInputStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  const handleContentSizeChange = ({ nativeEvent }: TextInputContentSizeChangeEvent) => {
    const height = nativeEvent.contentSize.height;
    const newHeight = Math.min(Math.max(COMMENT_INPUT_HEIGHT, height), MAX_COMMENT_INPUT_HEIGHT);
    animatedHeight.value = withTiming(newHeight, { duration: 150 });
  };

  const handleSubmit = () => {
    if (!value.trim()) return;

    const { queryKey, parentComment, actions } = useCommentStore.getState();
    const { reset: resetStore } = actions;

    addComment({
      id: `temp-${randomUUID()}`,
      post: replyTo ? replyTo.post : parentComment ? parentComment.post : post,
      repliedTo: replyTo,
      parent: parentComment,
      content: value,
      queryKey: queryKey ?? rootQueryKey,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      author: meProfile!,
    });

    inputRef.current?.clear();
    setValue('');
    resetStore();
    Keyboard.dismiss();
  };

  // Separate effect for keyboard hide listener
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsFocused(false);
      inputRef.current?.blur();
    });

    return () => subscription.remove();
  }, []);

  // Separate effect for focus when replying
  useEffect(() => {
    if (replyTo?.id) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
    return;
  }, [replyTo?.id]);

  return (
    <Box className="absolute inset-x-0 bottom-0 bg-background-50" style={style} onLayout={onLayout}>
      {replyToAuthor && (
        <HStack space="xs" className="items-center bg-primary-0 px-4 py-2">
          <Text className="flex-1 text-primary-700">
            Replying to <NameLink {...replyToAuthor} className="text-primary-700" />
          </Text>
          <AnimatedPressable className="p-2" onPress={reset}>
            <Icon as={XIcon} className="text-primary-700" />
          </AnimatedPressable>
        </HStack>
      )}
      <KeyboardAvoidingScrollView
        className="border-outline-200 px-4 py-2"
        style={{ borderTopWidth: 1 }}
      >
        <HStack space="sm" className="items-start">
          <AnimatedInput className="flex-1" style={animatedInputStyle}>
            <InputField
              //@ts-expect-error Gluestack mistyping - safe to ignore
              ref={inputRef}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={setValue}
              onContentSizeChange={handleContentSizeChange}
              placeholder="Write a comment..."
              multiline
              autoFocus
            />
          </AnimatedInput>
          {(isFocused || value) && (
            <Button
              variant={value ? 'solid' : 'link'}
              className="px-4"
              style={{ height: COMMENT_INPUT_HEIGHT }}
              onPress={handleSubmit}
            >
              <ButtonIcon as={SendIcon} />
            </Button>
          )}
        </HStack>
      </KeyboardAvoidingScrollView>
    </Box>
  );
}

function NameLink({
  value,
  relationTo,
  bold = true,
  numberOfLines = 1,
  ...props
}: Comment['author'] & TextProps) {
  const id = extractID(value);
  const doc = extractCollection(value);
  const name = doc?.displayName || 'Unknown User';

  return (
    <Link asChild push href={`/profile/${relationTo}/${id}`}>
      <Text {...props} bold={bold} numberOfLines={numberOfLines}>
        {name}
      </Text>
    </Link>
  );
}

function reply({
  comment,
  rootQueryKey,
  subQueryKey,
}: {
  comment: Comment;
  rootQueryKey: QueryKey;
  subQueryKey: QueryKey;
}) {
  const { setParentComment, setReplyTo, setQueryKey } = useCommentStore.getState().actions;
  const parent = extractCollection(comment.parent);
  // Use the comment of current item
  setReplyTo(comment);

  if (parent) {
    // This means that we are replying to a reply, so we need to set the parent comment
    // the same as the parent of the current reply. This ensures that the new reply is correctly
    // nested under the original comment.
    setParentComment(parent);
    setQueryKey(rootQueryKey);
  } else {
    // This means that we are replying to a top-level comment, so we set it as the parent comment.
    setParentComment(comment);
    setQueryKey(subQueryKey);
  }
}
