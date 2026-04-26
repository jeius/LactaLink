import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatNumberToShortenUnits } from '@lactalink/utilities/formatters';
import { HeartIcon } from 'lucide-react-native';

interface CommentLikeButtonProps {
  hasLiked: boolean;
  toggleLike: () => void;
  likesCount: number;
  isPending: boolean;
}

export default function CommentLikeButton({
  likesCount,
  hasLiked: isLiked,
  toggleLike,
  isPending,
}: CommentLikeButtonProps) {
  return (
    <VStack space="xs" className="items-center justify-start">
      <VStack className="flex-1 items-center justify-center">
        <Pressable
          className="p-1"
          disabled={isPending}
          onPress={() => {
            if (isPending) return;
            toggleLike();
          }}
        >
          <Icon
            as={HeartIcon}
            size="xl"
            className={isLiked ? 'fill-primary-500 stroke-primary-600' : ''}
          />
        </Pressable>

        <Text size="sm" bold>
          {formatNumberToShortenUnits(likesCount)}
        </Text>
      </VStack>
    </VStack>
  );
}
