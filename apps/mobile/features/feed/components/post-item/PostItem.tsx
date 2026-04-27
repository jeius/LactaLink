import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { TruncatedText } from '@/components/ui/truncated-text';
import { VStack } from '@/components/ui/vstack';
import PostAuthor from '@/features/feed/components/post-item/PostAuthor';
import PostMedia from '@/features/feed/components/post-item/PostMedia';
import PostStats from '@/features/feed/components/post-item/PostStats';
import { useMeUser } from '@/hooks/auth/useAuth';
import { isTempID } from '@/lib/utils/tempID';
import { Post } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { GestureResponderEvent } from 'react-native';
import PostActionMenu from './PostActionMenu';
import PostShare from './PostShare';

interface PostItemProps {
  post: Post;
  onPress?: (e: GestureResponderEvent) => void;
}
export default function PostItem({ post, onPress }: PostItemProps) {
  const { data: meUser } = useMeUser();
  const { author, createdAt, attachments, sharedFrom, content, title, id } = post;
  const isTemp = isTempID(post.id);
  const isMeUser = isEqualProfiles(meUser?.profile, author);

  const hasAttachments = attachments && attachments.length > 0;
  const titleInitialLines = hasAttachments ? 2 : 3;
  const contentInitialLines = hasAttachments ? 2 : 5;

  return (
    <Card isDisabled={isTemp} variant="filled" className="flex-col items-stretch rounded-none p-0">
      <Pressable onPress={onPress} className="flex-col items-stretch space-y-2 p-3">
        <HStack space="lg" className="items-center justify-between">
          <PostAuthor author={author} createdAt={createdAt} />
          {isMeUser && <PostActionMenu post={post} />}
        </HStack>

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
      </Pressable>

      {attachments && attachments.length > 0 && (
        <PostMedia id={post.id} attachments={attachments} />
      )}

      {sharedFrom && (
        <Box
          className="bg-background-50 py-2"
          style={{ marginTop: attachments && attachments.length > 0 ? 4 : 0 }}
        >
          <PostShare sharedFrom={sharedFrom} />
        </Box>
      )}

      <PostStats post={post} />
    </Card>
  );
}
