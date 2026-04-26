import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { useLikeInteraction } from '@/features/feed/hooks/useLikeInteraction';
import { Post } from '@lactalink/types/payload-generated-types';
import { formatNumberToShortenUnits } from '@lactalink/utilities/formatters';
import { useRouter } from 'expo-router';
import { HeartIcon, MessageCircleIcon } from 'lucide-react-native';
import { useCallback } from 'react';
import { GestureResponderEvent } from 'react-native';

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

  const { commentsCount } = post;
  const {
    hasLiked,
    toggleLike,
    likesCount,
    isPending: isLiking,
  } = useLikeInteraction({ relationTo: 'posts', value: post });

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
      router.push(`/posts/${post.id}/comments`);
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
