import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import CommentsSheet from '@/features/feed/components/comments/CommentsSheet';
import { FeedCommentsSearchParams } from '@/lib/types/searchParams';
import { useLocalSearchParams } from 'expo-router';

export default function CommentsSheetPage() {
  const { post: postID } = useLocalSearchParams<FeedCommentsSearchParams>();

  if (!postID) {
    return (
      <Box className="flex-1 justify-center">
        <Text bold className="text-center text-typography-800">
          Unable to load comments
        </Text>
        <Text className="text-center text-typography-600">
          The post was not found. Please try again later.
        </Text>
      </Box>
    );
  }

  return <CommentsSheet postID={postID} />;
}
