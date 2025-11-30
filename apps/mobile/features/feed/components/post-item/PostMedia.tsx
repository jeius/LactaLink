import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { BLUR_HASH } from '@/lib/constants';
import { ImageData, MediaAttachment } from '@lactalink/types';
import { Post } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FeedSearchParams } from '../../lib/types';

interface PostMediaProps {
  attachments: MediaAttachment[];
  id: Post['id'];
}
export default function PostMedia({ attachments, id }: PostMediaProps) {
  const router = useRouter();

  const media = useMemo(
    () =>
      attachments
        .map((att) => {
          const data = extractCollection(att.image);
          if (!data) return null;
          return {
            id: att.id,
            imageData: extractOneImageData(data),
            caption: att.caption,
            type: att.mediaType,
          };
        })
        .filter((i) => i !== null),
    [attachments]
  );

  const length = media.length;

  const handlePress = (index: number) => {
    const params: FeedSearchParams = { media: index.toString() };
    // @ts-expect-error -- Expo Router types are broken
    router.push({ pathname: `/feed/${id}`, params });
  };

  if (length === 0) return null;
  else if (length === 1)
    return (
      <Box className="h-64 w-full">
        <ImageComp image={media[0]!.imageData} />
      </Box>
    );
  else if (length === 2)
    return (
      <HStack space="xs" className="h-48 w-full">
        {media.map((m, idx) => (
          <Pressable key={m.id} className="flex-1" onPress={() => handlePress(idx)}>
            <ImageComp image={m!.imageData} />
          </Pressable>
        ))}
      </HStack>
    );
  else if (length === 3)
    return (
      <VStack space="xs" className="w-full">
        <Pressable className="h-48 w-full" onPress={() => handlePress(0)}>
          <ImageComp image={media[0]!.imageData} />
        </Pressable>
        <HStack space="xs" className="h-32 w-full">
          {media.slice(1).map((m, idx) => (
            <Pressable key={m.id} className="flex-1" onPress={() => handlePress(idx + 1)}>
              <ImageComp image={m!.imageData} />
            </Pressable>
          ))}
        </HStack>
      </VStack>
    );
  else
    return (
      <VStack space="xs" className="w-full">
        <Pressable onPress={() => handlePress(0)} className="h-48 w-full">
          <ImageComp image={media[0]!.imageData} />
        </Pressable>
        <HStack space="xs" className="h-32 w-full">
          <Pressable onPress={() => handlePress(1)} className="flex-1">
            <ImageComp image={media[1]!.imageData} />
          </Pressable>
          <Pressable onPress={() => handlePress(2)} className="flex-1 items-center justify-center">
            <Box className="absolute inset-0">
              <ImageComp image={media[2]!.imageData} />
            </Box>
            <Box className="absolute inset-0 bg-background-700" style={{ opacity: 0.5 }} />
            <Text size="xl" bold className="text-primary-0">
              +{length - 3}
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    );
}

function ImageComp({ image }: { image: ImageData }) {
  const uri = image.uri;
  const blurHash = image.blurHash;
  const alt = image.alt || 'Image';

  if (!uri)
    return (
      <Text size="xs" className="flex-1 text-center align-middle">
        No Image
      </Text>
    );

  return (
    <Image
      source={{ uri: uri }}
      placeholder={{ blurhash: blurHash ?? BLUR_HASH }}
      alt={alt}
      style={{ width: '100%', height: '100%' }}
      contentFit={'cover'}
      recyclingKey={`image-${uri}`}
      accessibilityLabel={alt}
    />
  );
}
