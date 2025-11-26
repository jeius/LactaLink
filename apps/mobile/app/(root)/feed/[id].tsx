import { AnimatedPressable } from '@/components/animated/pressable';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { TruncatedText } from '@/components/ui/truncated-text';
import { VStack } from '@/components/ui/vstack';
import PostAuthor from '@/features/feed/components/post-item/PostAuthor';
import PostMedia from '@/features/feed/components/post-item/PostMedia';
import PostShare from '@/features/feed/components/post-item/PostShare';
import PostStats from '@/features/feed/components/post-item/PostStats';
import { usePost } from '@/features/feed/hooks/usePost';
import { postsInfiniteOptions } from '@/features/feed/lib/queryOptions/postsInfiniteOptions';
import { FeedSearchParams } from '@/features/feed/lib/types';
import { InfiniteDataMap } from '@/lib/types';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractDisplayName } from '@lactalink/utilities/extractors';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { MessageSquareIcon, XIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';

type SearchParams = FeedSearchParams & { id: string };

export default function Feed() {
  const { id } = useLocalSearchParams<SearchParams>();

  const { data: mappedData } = useInfiniteQuery(postsInfiniteOptions);
  const queryKey = postsInfiniteOptions.queryKey;

  const initialData = useMemo(() => getPost(id, mappedData), [id, mappedData]);
  const { data: post, isLoading } = usePost(id, initialData);

  if (isLoading || !post) return <LoadingSpinner />;

  const authorName = extractDisplayName({ profile: post.author });
  const { author, createdAt, title, content, attachments, sharedFrom } = post;

  const hasAttachments = attachments && attachments.length > 0;
  const titleInitialLines = hasAttachments ? 2 : 3;
  const contentInitialLines = hasAttachments ? 2 : 5;

  return (
    <SafeArea className="items-stretch justify-start">
      <Header authorName={authorName} />

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

      <PostStats post={post} queryKey={queryKey} disableCommentPress />

      <Divider orientation="horizontal" />
    </SafeArea>
  );
}

function Header({ authorName }: { authorName: string }) {
  return (
    <HStack space="sm" className="items-center px-4 py-2">
      <AnimatedPressable className={'overflow-hidden rounded-full p-2'}>
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

      <PostStats post={post} queryKey={queryKey} disableCommentPress />

      <Divider orientation="horizontal" />
    </>
  );
}

function getPost(id: string, data?: InfiniteDataMap<Post, unknown>) {
  if (!data) return;
  for (const page of data.pages) {
    return page.docs.get(id);
  }
  return;
}
