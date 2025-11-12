import React, { useCallback, useEffect, useMemo } from 'react';

import { ProfileAvatar } from '@/components/Avatar';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID, extractOneImageData } from '@lactalink/utilities/extractors';
import { formatTimeToPastLabel } from '@lactalink/utilities/formatters';
import { isIndividual } from '@lactalink/utilities/type-guards';
import { useRecyclingState } from '@shopify/flash-list';
import { Link } from 'expo-router';
import { BadgeCheckIcon, HeartIcon, MessageCircleIcon } from 'lucide-react-native';
import { TextLayoutEvent } from 'react-native';
import { SingleImageViewer } from '../ImageViewer';
import { Box } from '../ui/box';

export function FeedItemCard({ item }: { item: Post }) {
  const { author, createdAt, attachments } = item;

  return (
    <Card variant="filled" className="flex-col items-stretch rounded-none p-0">
      <Pressable className="flex-col items-stretch space-y-2 p-3">
        <Author author={author} createdAt={createdAt} />
        <ContentText {...item} />
      </Pressable>
      {attachments && <MediaAttachments attachments={attachments} />}
      <Stats {...item} />
    </Card>
  );
}

function ContentText({ content, title, id, attachments }: Post) {
  const hasAttachments = attachments && attachments.length > 0;
  const titleInitialLines = hasAttachments ? 2 : 3;
  const contentInitialLines = hasAttachments ? 2 : 5;

  const [mounted, setMounted] = useRecyclingState(false, [id]);

  const [titleShown, setTitleShown] = useRecyclingState(false, [id]);
  const [titleLengthMore, setTitleLengthMore] = useRecyclingState(false, [id]);

  const [contentShown, setContentShown] = useRecyclingState(false, [id]);
  const [contentLengthMore, setContentLengthMore] = useRecyclingState(false, [id]);

  const toggleTitleLines = () => setTitleShown(!titleShown);
  const toggleContentLines = () => setContentShown(!contentShown);

  const onTitleLayout = useCallback(
    (e: TextLayoutEvent) => {
      if (!titleLengthMore && e.nativeEvent.lines.length > titleInitialLines) {
        setTitleLengthMore(true);
      }
    },
    [titleInitialLines, titleLengthMore, setTitleLengthMore]
  );

  const onContentLayout = useCallback(
    (e: TextLayoutEvent) => {
      if (!contentLengthMore && e.nativeEvent.lines.length > contentInitialLines) {
        setContentLengthMore(true);
      }
    },
    [contentInitialLines, contentLengthMore, setContentLengthMore]
  );

  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  return (
    <VStack className="mt-2 items-start">
      <Text
        size="lg"
        bold
        onTextLayout={onTitleLayout}
        numberOfLines={(mounted && (titleShown ? undefined : titleInitialLines)) || undefined}
        className="flex-1"
      >
        {title}
      </Text>
      {titleLengthMore && (
        <Pressable onPress={toggleTitleLines}>
          <Text size="sm" className="font-JakartaSemiBold">
            {titleShown ? '—See less' : '—See more'}
          </Text>
        </Pressable>
      )}
      {content && (
        <>
          <Text
            onTextLayout={onContentLayout}
            numberOfLines={
              (mounted && (contentShown ? undefined : contentInitialLines)) || undefined
            }
            className="mt-2"
          >
            {content}
          </Text>
          {contentLengthMore && (
            <Pressable onPress={toggleContentLines}>
              <Text size="sm" className="font-JakartaSemiBold">
                {contentShown ? '—See less' : '—See more'}
              </Text>
            </Pressable>
          )}
        </>
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

function Stats({ likesCount, commentsCount }: Post) {
  return (
    <HStack space="md" className="p-3">
      <HStack space="xs" className="items-center">
        <Icon as={HeartIcon} size="md" className="fill-primary-500 stroke-primary-600" />
        <Text size="sm">{likesCount}</Text>
      </HStack>
      <HStack space="xs" className="items-center">
        <Icon as={MessageCircleIcon} size="sm" />
        <Text size="sm">{commentsCount}</Text>
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
