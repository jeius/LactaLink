import { AnimatedPressable } from '@/components/animated/pressable';
import { ProfileAvatar } from '@/components/Avatar';
import NameLink from '@/components/NameLink';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text, TextProps } from '@/components/ui/text';
import { TruncatedText } from '@/components/ui/truncated-text';
import { VStack } from '@/components/ui/vstack';
import { Comment } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { formatTimeToPastLabel } from '@lactalink/utilities/formatters';
import { isIndividual } from '@lactalink/utilities/type-guards';
import { useRecyclingState } from '@shopify/flash-list';
import { Link } from 'expo-router';
import { BadgeCheckIcon } from 'lucide-react-native';
import React, { ReactNode } from 'react';
import { Keyboard } from 'react-native';

const INITIAL_COMMENT_LINES = 3;

interface CommentItemProps {
  comment: Comment;
  isTemporary: boolean;
  avatarSize: number;
  likeButton: ReactNode;
  replies?: ReactNode;
  onReplyPress: () => void;
  onLongPress: () => void;
}

/**
 * Pure presentational component for rendering a single comment
 * Does not handle any data fetching or mutations
 */
export default function CommentItem({
  comment,
  isTemporary,
  avatarSize,
  likeButton,
  replies,
  onReplyPress,
  onLongPress,
}: CommentItemProps) {
  const handleLongPress = () => {
    Keyboard.dismiss();
    onLongPress();
  };

  return (
    <Pressable
      disabled={isTemporary}
      pointerEvents={isTemporary ? 'none' : 'auto'}
      onLongPress={handleLongPress}
    >
      <VStack space="xs" className="items-stretch">
        <HStack space="sm" className="items-start">
          <ProfileAvatar
            profile={comment.author}
            style={{ width: avatarSize, height: avatarSize }}
            enablePress
          />

          <VStack space="xs" className="flex-1">
            <HStack space="sm" className="items-stretch">
              <VStack space="xs" className="flex-1 items-stretch">
                <AuthorName author={comment.author} createdAt={comment.createdAt} />
                <CommentContent
                  id={comment.id}
                  content={comment.content}
                  repliedTo={comment.repliedTo}
                />
                <AnimatedPressable className="self-start" hitSlop={8} onPress={onReplyPress}>
                  <Text size="sm" className="font-JakartaSemiBold text-primary-700">
                    Reply
                  </Text>
                </AnimatedPressable>
              </VStack>

              {likeButton}
            </HStack>

            {replies}
          </VStack>
        </HStack>
      </VStack>
    </Pressable>
  );
}

function CommentContent({
  content,
  size,
  repliedTo,
  id,
}: Pick<Comment, 'id' | 'content' | 'repliedTo'> & Pick<TextProps, 'size'>) {
  const [pressed, setPressed] = useRecyclingState(false, [id]);

  const authorReplied = extractCollection(repliedTo)?.author;
  const authorRepliedFullname =
    extractCollection(authorReplied?.value)?.displayName || 'Unknown User';
  const authorID = extractID(authorReplied?.value);
  const authorSlug = authorReplied?.relationTo;
  return (
    <TruncatedText
      size={size}
      className="grow"
      initialLines={INITIAL_COMMENT_LINES}
      recyclingKey={id}
    >
      {authorID && authorSlug && (
        <Link asChild push href={`/profile/${authorSlug}/${authorID}`}>
          <Text
            size={size}
            bold
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-primary-500"
            underline={pressed}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
          >
            @{authorRepliedFullname}
            {'  '}
          </Text>
        </Link>
      )}
      {content}
    </TruncatedText>
  );
}

function AuthorName({
  author,
  createdAt,
  size = 'sm',
}: Pick<Comment, 'author' | 'createdAt'> & Pick<TextProps, 'size'>) {
  const authorDoc = extractCollection(author.value);
  const isVerified = authorDoc && isIndividual(authorDoc) && authorDoc.isVerified;

  return (
    <HStack space="xs" className="flex-row items-center">
      <NameLink {...author} size={size} />

      {isVerified && <Icon as={BadgeCheckIcon} className="fill-info-500 stroke-info-0" />}

      <Text size={size} className="text-typography-700">
        {formatTimeToPastLabel(createdAt)}
      </Text>
    </HStack>
  );
}
