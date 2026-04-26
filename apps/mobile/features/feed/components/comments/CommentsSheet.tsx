import { Box } from '@/components/ui/box';
import FormSheetHandle from '@/components/ui/FormSheetHandle';
import { InfiniteFlashList } from '@/components/ui/list/InfiniteFlashList';
import { Text } from '@/components/ui/text';
import { useAddCommentMutation } from '@/features/feed/hooks/useAddCommentMutation';
import { CommentPayload, ReplyArgs } from '@/features/feed/lib/types';
import { getMeUser } from '@/lib/stores/meUserStore';
import { createTempID } from '@/lib/utils/tempID';
import { Comment } from '@lactalink/types/payload-generated-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { listKeyExtractor } from '@lactalink/utilities/extractors';
import { QueryKey, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { createCommentsInfiniteOptions } from '../../lib/queryOptions/commentsInfiniteOptions';
import CommentInput from './CommentInput';
import CommentItemPlaceholder from './CommentItemPlaceholder';
import CommentsListItem from './CommentsListItem';

interface CommentsSheetProps {
  postID: string;
}

const PLACEHOLDER_COMMENTS = generatePlaceHoldersWithID(10, {} as Comment);

export default function CommentsSheet({ postID }: CommentsSheetProps) {
  const commentsInfiniteOptions = createCommentsInfiniteOptions(postID);
  const commentsQueryKey = commentsInfiniteOptions.queryKey;

  const { data, isRefetching, refetch, ...commentsQuery } =
    useInfiniteQuery(commentsInfiniteOptions);
  const comments = useMemo(() => data?.pages.flatMap((p) => Array.from(p.docs.values())), [data]);

  const [inputHeight, setInputHeight] = useState(0);

  const [repliedComment, setRepliedComment] = useState<Comment | null>(null);
  const [parentComment, setParentComment] = useState<Comment | null>(null);
  const [invalidateQueryKey, setInvalidateQueryKey] = useState<QueryKey>(commentsQueryKey);

  const { mutate: addComment } = useAddCommentMutation(postID);

  const handleReset = () => {
    setRepliedComment(null);
    setParentComment(null);
    setInvalidateQueryKey(commentsQueryKey);
  };

  const handleSubmit = (value: string) => {
    const meUser = getMeUser();
    const meProfile = meUser?.profile;
    if (!meProfile) return;

    const payload: CommentPayload = {
      id: createTempID(),
      post: repliedComment?.post ?? parentComment?.post ?? postID,
      repliedTo: repliedComment ?? undefined,
      parent: parentComment ?? undefined,
      content: value,
      queryKey: invalidateQueryKey,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      author: meProfile,
    };

    addComment(payload);
    handleReset();
  };

  const handleReply = ({ comment, queryKey, parentComment }: ReplyArgs) => {
    setRepliedComment(comment);
    setInvalidateQueryKey(queryKey);
    setParentComment(parentComment);
  };

  return (
    <Box className="flex-1 bg-background-50">
      <FormSheetHandle />

      <InfiniteFlashList
        {...commentsQuery}
        gap={16}
        data={commentsQuery.isLoading ? PLACEHOLDER_COMMENTS : (comments ?? [])}
        keyExtractor={listKeyExtractor}
        contentContainerClassName="px-4 py-2 grow"
        contentContainerStyle={{ paddingBottom: inputHeight + 8 }}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={<ListEmpty />}
        renderItem={({ item }) =>
          isPlaceHolderData(item) ? (
            <CommentItemPlaceholder />
          ) : (
            <CommentsListItem comment={item} onReply={handleReply} />
          )
        }
      />

      <CommentInput
        onLayout={(e) => setInputHeight(e.nativeEvent.layout.height)}
        onSubmit={handleSubmit}
        onReplyCancel={handleReset}
        replyToAuthor={repliedComment?.author}
      />
    </Box>
  );
}

function ListEmpty() {
  return (
    <Box className="flex-1 items-center justify-center py-8">
      <Text className="text-center text-typography-700">
        No comments yet. Be the first to comment!
      </Text>
    </Box>
  );
}
