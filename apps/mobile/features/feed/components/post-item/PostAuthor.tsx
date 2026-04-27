import { useMemo } from 'react';

import { ProfileAvatar } from '@/components/Avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { formatTimeToPastLabel } from '@lactalink/utilities/formatters';
import { isIndividual } from '@lactalink/utilities/type-guards';
import { Link } from 'expo-router';
import { BadgeCheckIcon } from 'lucide-react-native';

export default function PostAuthor({ author, createdAt }: Pick<Post, 'author' | 'createdAt'>) {
  const timeAgo = useMemo(() => formatTimeToPastLabel(createdAt), [createdAt]);
  const authorID = extractID(author.value);
  const authorDoc = extractCollection(author.value);
  const authorFullName = authorDoc?.displayName || 'Unknown User';
  const isVerified = (authorDoc && isIndividual(authorDoc) && authorDoc.isVerified) ?? false;

  return (
    <HStack space="xs" className="flex-row items-start">
      <ProfileAvatar profile={author} style={{ height: 32, width: 32 }} enablePress />

      <VStack style={{ marginLeft: 4 }}>
        <Link asChild push href={`/profile/${author.relationTo}/${authorID}`}>
          <Button size="sm" variant="link" action="default" className="h-fit w-fit p-0">
            <ButtonText className="font-JakartaBold">{authorFullName}</ButtonText>
          </Button>
        </Link>
        <Text size="xs" className="text-typography-700">
          {timeAgo}
        </Text>
      </VStack>

      {isVerified && <Icon as={BadgeCheckIcon} className="fill-info-500 stroke-info-0" />}
    </HStack>
  );
}
