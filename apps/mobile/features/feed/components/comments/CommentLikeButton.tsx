import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useLikeInteraction } from '@/features/feed/hooks/useLikeInteraction';
import { Comment } from '@lactalink/types/payload-generated-types';
import { formatNumberToShortenUnits } from '@lactalink/utilities/formatters';
import { QueryKey } from '@tanstack/react-query';
import { HeartIcon } from 'lucide-react-native';
import React from 'react';

interface CommentLikeButtonProps {
  comment: Comment;
  queryKey: QueryKey;
}

export default function CommentLikeButton({ comment, queryKey }: CommentLikeButtonProps) {
  const { likesCount, hasLiked, toggleLike, isPending } = useLikeInteraction(
    { relationTo: 'comments', value: comment },
    queryKey
  );

  return (
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
  );
}
