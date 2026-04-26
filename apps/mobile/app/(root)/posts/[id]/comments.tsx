import { Box } from '@/components/ui/box';
import FormSheetHandle from '@/components/ui/FormSheetHandle';
import { Text } from '@/components/ui/text';
import CommentsList from '@/features/feed/components/comments/CommentsList';
import { useLocalSearchParams } from 'expo-router';

export default function CommentsSheetPage() {
  const { id: postID } = useLocalSearchParams<{ id: string }>();

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

  return (
    <Box className="flex-1 bg-background-50">
      <FormSheetHandle />
      <CommentsList postID={postID} />
    </Box>
  );
}
