import React, { useCallback } from 'react';

import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { useLikeInteraction } from '@/features/feed/hooks/useLikeInteraction';
import { FeedCommentsSearchParams } from '@/lib/types/searchParams';
import { Post } from '@lactalink/types/payload-generated-types';
import { formatNumberToShortenUnits } from '@lactalink/utilities/formatters';
import { useRouter } from 'expo-router';
import { HeartIcon, MessageCircleIcon } from 'lucide-react-native';
import { GestureResponderEvent } from 'react-native';
import { postsInfiniteOptions } from '../../lib/queryOptions/postsInfiniteOptions';

interface PostStatsProps {
  post: Post;
  onCommentPress?: (e: GestureResponderEvent) => void;
  onLikePress?: (e: GestureResponderEvent) => void;
  disableCommentPress?: boolean;
}

export default function PostStats({
  post,
  onCommentPress,
  onLikePress,
  disableCommentPress = false,
}: PostStatsProps) {
  const router = useRouter();
  const queryKey = postsInfiniteOptions.queryKey;

  const { commentsCount } = post;
  const {
    hasLiked,
    toggleLike,
    likesCount,
    isPending: isLiking,
  } = useLikeInteraction({ relationTo: 'posts', value: post }, queryKey);

  const handleLikePress = useCallback(
    (e: GestureResponderEvent) => {
      onLikePress?.(e);
      if (e.isDefaultPrevented()) return;
      if (isLiking) return;
      toggleLike();
    },
    [isLiking, onLikePress, toggleLike]
  );

  const handleCommentPress = useCallback(
    (e: GestureResponderEvent) => {
      onCommentPress?.(e);
      if (e.isDefaultPrevented()) return;
      const params: FeedCommentsSearchParams = { post: post.id };
      router.push({ pathname: '/feed/comments', params });
    },
    [onCommentPress, post.id, router]
  );

  return (
    <HStack>
      <Pressable
        className="flex-row items-center gap-1 p-3"
        hitSlop={8}
        role="button"
        disabled={isLiking}
        onPress={handleLikePress}
      >
        <Icon
          as={HeartIcon}
          size="2xl"
          className={hasLiked ? 'fill-primary-500 stroke-primary-600' : ''}
        />
        <Text bold>{formatNumberToShortenUnits(likesCount)}</Text>
      </Pressable>
      <Pressable
        className="flex-row items-center gap-1 p-3"
        hitSlop={8}
        role="button"
        onPress={handleCommentPress}
        pointerEvents={disableCommentPress ? 'none' : 'auto'}
      >
        <Icon as={MessageCircleIcon} size="xl" />
        <Text bold>{formatNumberToShortenUnits(commentsCount ?? 0)}</Text>
      </Pressable>
    </HStack>
  );
}
