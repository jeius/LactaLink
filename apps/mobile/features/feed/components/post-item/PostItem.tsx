import React from 'react';

import { Card } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { TruncatedText } from '@/components/ui/truncated-text';
import { VStack } from '@/components/ui/vstack';
import PostAuthor from '@/features/feed/components/post-item/PostAuthor';
import PostMedia from '@/features/feed/components/post-item/PostMedia';
import PostStats from '@/features/feed/components/post-item/PostStats';
import { isTempID } from '@/lib/utils/tempID';
import { Post } from '@lactalink/types/payload-generated-types';
import { GestureResponderEvent } from 'react-native';
import PostShare from './PostShare';

interface PostItemProps {
  post: Post;
  onPress?: (e: GestureResponderEvent) => void;
}
export default function PostItem({ post, onPress }: PostItemProps) {
  const { author, createdAt, attachments, sharedFrom, content, title, id } = post;
  const isTemp = isTempID(post.id);

  const hasAttachments = attachments && attachments.length > 0;
  const titleInitialLines = hasAttachments ? 2 : 3;
  const contentInitialLines = hasAttachments ? 2 : 5;

  return (
    <Card isDisabled={isTemp} variant="filled" className="flex-col items-stretch rounded-none p-0">
      <Pressable onPress={onPress} className="flex-col items-stretch space-y-2 p-3">
        <PostAuthor author={author} createdAt={createdAt} />

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

      {attachments && attachments.length > 0 && <PostMedia attachments={attachments} />}

      {sharedFrom && <PostShare sharedFrom={sharedFrom} />}

      <PostStats post={post} />
    </Card>
  );
}
