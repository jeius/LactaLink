import { AnimatedPressable } from '@/components/animated/pressable';
import { SingleImageViewer } from '@/components/ImageViewer';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { FlashList, FlashListRef, ListRenderItem } from '@/components/ui/FlashList';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { TruncatedText } from '@/components/ui/truncated-text';
import { VStack } from '@/components/ui/vstack';
import { useNavigateToChat } from '@/features/chat/hooks/useNavigateToChat';
import CommentsList from '@/features/feed/components/comments/CommentsList';
import PostActionMenu from '@/features/feed/components/post-item/PostActionMenu';
import PostAuthor from '@/features/feed/components/post-item/PostAuthor';
import PostMedia from '@/features/feed/components/post-item/PostMedia';
import PostShare from '@/features/feed/components/post-item/PostShare';
import PostStats from '@/features/feed/components/post-item/PostStats';
import { useInfinitePosts } from '@/features/feed/hooks/useInfinitePosts';
import { createPostQueryOptions } from '@/features/feed/lib/queryOptions/postQueryOptions';
import { FeedSearchParams } from '@/features/feed/lib/types';
import { useProfileData } from '@/features/profile/hooks/useProfileData';
import { useMeUser } from '@/hooks/auth/useAuth';
import { InfiniteDataMap } from '@/lib/types';
import { Post } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import {
  extractCollection,
  extractDisplayName,
  extractID,
  extractOneImageData,
} from '@lactalink/utilities/extractors';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MessageSquareIcon, XIcon } from 'lucide-react-native';
import { useEffect, useMemo, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SearchParams = FeedSearchParams & { id: string };

export default function ViewPost() {
  const { id, media } = useLocalSearchParams<SearchParams>();
  const mediaIndex = media ? parseInt(media) : undefined;

  const { dataMap: mappedData } = useInfinitePosts();

  const initialData = useMemo(() => getPost(id, mappedData), [id, mappedData]);
  const postQueryOptions = createPostQueryOptions(id, initialData);
  const { data: post, isLoading } = useQuery(postQueryOptions);

  if (isLoading || !post) return <LoadingSpinner />;

  return (
    <SafeArea safeBottom={false} className="items-stretch justify-start">
      <Header {...post} />
      {mediaIndex !== undefined ? (
        <MediaContent {...post} mediaIndex={mediaIndex} />
      ) : (
        <CommentsList
          postID={post.id}
          headerClassName="-mx-4 mb-4"
          ListHeaderComponent={<ListHeader {...post} />}
        />
      )}
    </SafeArea>
  );
}

function Header(post: Post) {
  const router = useRouter();
  const { data: author } = useProfileData(post.author);

  const authorName = extractDisplayName({ profile: author });

  const handleBackPress = () => router.back();
  const goToChat = useNavigateToChat(extractID(author?.value.owner));

  return (
    <HStack space="sm" className="items-center px-4 py-2">
      <AnimatedPressable onPress={handleBackPress} className={'overflow-hidden rounded-full p-2'}>
        <Icon as={XIcon} size="xl" />
      </AnimatedPressable>

      <Text bold size="lg" numberOfLines={1} className="flex-1 text-center">
        {authorName}
      </Text>

      <AnimatedPressable
        className={'overflow-hidden rounded-full p-2'}
        onPress={() => goToChat('push')}
      >
        <Icon as={MessageSquareIcon} size="xl" />
      </AnimatedPressable>
    </HStack>
  );
}

function ListHeader({ mediaIndex, ...post }: Post & { mediaIndex?: number }) {
  const { data: meUser } = useMeUser();
  const { author, createdAt, title, content, attachments, sharedFrom, id } = post;
  const isMeUser = isEqualProfiles(meUser?.profile, author);

  const hasAttachments = attachments && attachments.length > 0;
  const titleInitialLines = hasAttachments ? 2 : 3;
  const contentInitialLines = hasAttachments ? 2 : 5;
  return (
    <>
      <VStack space="sm" className="p-3">
        <HStack space="lg" className="items-center justify-between">
          <PostAuthor author={author} createdAt={createdAt} />
          {isMeUser && <PostActionMenu post={post} />}
        </HStack>

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

      {mediaIndex === undefined && attachments && attachments.length > 0 && (
        <PostMedia attachments={attachments} id={post.id} />
      )}

      {sharedFrom && <PostShare sharedFrom={sharedFrom} />}

      <PostStats post={post} disableCommentPress={mediaIndex === undefined} />

      <Divider orientation="horizontal" />
    </>
  );
}

function MediaContent({ mediaIndex = 0, ...post }: Post & { mediaIndex?: number }) {
  const insets = useSafeAreaInsets();
  const ref = useRef<FlashListRef<NonNullable<typeof media>[number]>>(null);

  const media = useMemo(
    () =>
      post.attachments
        ?.map((att) => {
          const data = extractCollection(att.image);
          if (!data) return null;
          return {
            id: att.id,
            imageData: extractOneImageData(data),
            caption: att.caption,
            type: att.mediaType,
          };
        })
        .filter((i) => i !== null),
    [post.attachments]
  );

  const renderItem: ListRenderItem<NonNullable<typeof media>[number]> = ({ item }) => {
    return (
      <Card className="rounded-none p-0">
        <Box className="h-64 w-full">
          <SingleImageViewer image={item!.imageData} />
        </Box>
        {item.caption && (
          <TruncatedText initialLines={3} className="mx-4 my-2">
            {item.caption}
          </TruncatedText>
        )}
      </Card>
    );
  };

  useEffect(() => {
    if (isNaN(mediaIndex)) return;
    if (!media || media.length === 0) return;
    if (mediaIndex < 0 || mediaIndex >= media.length) return;
    ref.current?.scrollToIndex({ index: mediaIndex, animated: false });
  }, [mediaIndex, media]);

  return (
    <FlashList
      ref={ref}
      data={media ?? []}
      headerClassName="mb-4"
      contentContainerClassName="pb-4"
      ItemSeparatorComponent={() => <Box className="h-3" />}
      ListHeaderComponent={() => <ListHeader {...post} mediaIndex={mediaIndex} />}
      style={{ marginBottom: insets.bottom + 4 }}
      renderItem={renderItem}
    />
  );
}

function getPost(id: string, data?: InfiniteDataMap<Post>) {
  if (!data) return;
  for (const page of data.pages) {
    return page.docs.get(id);
  }
  return;
}
