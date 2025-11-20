import React, { useCallback, useMemo } from 'react';

import { ProfileAvatar } from '@/components/Avatar';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useLikeInteraction } from '@/features/feed/hooks/useLikeInteraction';
import { FeedCommentsSearchParams } from '@/lib/types/searchParams';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID, extractOneImageData } from '@lactalink/utilities/extractors';
import { formatNumberToShortenUnits, formatTimeToPastLabel } from '@lactalink/utilities/formatters';
import { isIndividual } from '@lactalink/utilities/type-guards';
import { QueryKey } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import { BadgeCheckIcon, HeartIcon, MessageCircleIcon } from 'lucide-react-native';
import { SingleImageViewer } from '../ImageViewer';
import { Box } from '../ui/box';
import { TruncatedText } from '../ui/truncated-text';

export function FeedItemCard({ post, queryKey }: { post: Post; queryKey: QueryKey }) {
  const { author, createdAt, attachments } = post;

  return (
    <Card variant="filled" className="flex-col items-stretch rounded-none p-0">
      <Pressable className="flex-col items-stretch space-y-2 p-3">
        <Author author={author} createdAt={createdAt} />
        <ContentText {...post} />
      </Pressable>
      {attachments && <MediaAttachments attachments={attachments} />}
      <Stats post={post} queryKey={queryKey} />
    </Card>
  );
}

function ContentText({ content, title, id, attachments }: Post) {
  const hasAttachments = attachments && attachments.length > 0;
  const titleInitialLines = hasAttachments ? 2 : 3;
  const contentInitialLines = hasAttachments ? 2 : 5;

  return (
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
  );
}

function Author({ author, createdAt }: Pick<Post, 'author' | 'createdAt'>) {
  const timeAgo = useMemo(() => formatTimeToPastLabel(createdAt), [createdAt]);
  const authorID = extractID(author.value);
  const authorDoc = extractCollection(author.value);
  const authorFullName = authorDoc?.displayName || 'Unknown User';
  const isVerified = (authorDoc && isIndividual(authorDoc) && authorDoc.isVerified) ?? false;

  return (
    <HStack space="xs" className="flex-row items-start">
      <ProfileAvatar profile={author} style={{ height: 32, width: 32 }} enablePress />

      <VStack style={{ marginLeft: 4 }}>
        <Link asChild push href={`/profile/${author.relationTo}/${authorID}`}>
          <Text size="sm" bold numberOfLines={1} ellipsizeMode="tail">
            {authorFullName}
          </Text>
        </Link>
        <Text size="xs" className="text-typography-700">
          {timeAgo}
        </Text>
      </VStack>

      {isVerified && <Icon as={BadgeCheckIcon} className="fill-info-500 stroke-info-0" />}
    </HStack>
  );
}

function Stats({ post, queryKey }: { post: Post; queryKey: QueryKey }) {
  const router = useRouter();

  const { commentsCount } = post;
  const {
    hasLiked,
    toggleLike,
    likesCount,
    isPending: isLiking,
  } = useLikeInteraction({ relationTo: 'posts', value: post }, queryKey);

  const handleLikePress = useCallback(() => {
    if (isLiking) return;
    toggleLike();
  }, [isLiking, toggleLike]);

  const handleCommentPress = useCallback(() => {
    const params: FeedCommentsSearchParams = { post: post.id };
    router.push({ pathname: '/feed/comments', params });
  }, [router, post.id]);

  return (
    <HStack space="lg" className="p-3">
      <HStack space="xs" className="items-center">
        <Pressable onPress={handleLikePress} hitSlop={8} role="button" disabled={isLiking}>
          <Icon
            as={HeartIcon}
            size="2xl"
            className={hasLiked ? 'fill-primary-500 stroke-primary-600' : ''}
          />
        </Pressable>
        <Text bold>{formatNumberToShortenUnits(likesCount)}</Text>
      </HStack>
      <HStack space="xs" className="items-center">
        <Pressable hitSlop={8} role="button" onPress={handleCommentPress}>
          <Icon as={MessageCircleIcon} size="xl" />
        </Pressable>
        <Text bold>{formatNumberToShortenUnits(commentsCount ?? 0)}</Text>
      </HStack>
    </HStack>
  );
}

function MediaAttachments({ attachments }: { attachments: NonNullable<Post['attachments']> }) {
  const media = useMemo(
    () =>
      attachments
        .map((att) => {
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
    [attachments]
  );

  const length = media.length;

  if (length === 0) return null;
  else if (length === 1)
    return (
      <Box className="h-64 w-full">
        <SingleImageViewer image={media[0]!.imageData} />
      </Box>
    );
  else if (length === 2)
    return (
      <HStack space="xs" className="h-48 w-full">
        {media.map((m) => (
          <Box key={m.id} className="flex-1">
            <SingleImageViewer image={m!.imageData} />
          </Box>
        ))}
      </HStack>
    );
  else if (length === 3)
    return (
      <VStack space="xs" className="w-full">
        <Box className="h-48 w-full">
          <SingleImageViewer image={media[0]!.imageData} />
        </Box>
        <HStack space="xs" className="h-32 w-full">
          {media.slice(1).map((m) => (
            <Box key={m.id} className="flex-1">
              <SingleImageViewer image={m!.imageData} />
            </Box>
          ))}
        </HStack>
      </VStack>
    );
  else
    return (
      <VStack space="xs" className="w-full">
        <Box className="h-48 w-full">
          <SingleImageViewer image={media[0]!.imageData} />
        </Box>
        <HStack space="xs" className="h-32 w-full">
          {media.slice(1, 2).map((m) => (
            <Box key={m.id} className="flex-1">
              <SingleImageViewer image={m!.imageData} />
            </Box>
          ))}
          <Pressable className="flex-1 items-center justify-center rounded-lg bg-background-300">
            <Text size="xl" bold className="text-primary-0">
              +{length - 3}
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    );
}
