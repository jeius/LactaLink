import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { MediaAttachment } from '@lactalink/types';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import React, { useMemo } from 'react';

export default function PostMedia({ attachments }: { attachments: MediaAttachment[] }) {
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

  if (length === 0) return null;
  else if (length === 1)
    return (
      <Box className="h-64 w-full">
        <SingleImageViewer image={media[0]!.imageData} />
      </Box>
    );
  else if (length === 2)
    return (
      <HStack space="xs" className="h-48 w-full">
        {media.map((m) => (
          <Box key={m.id} className="flex-1">
            <SingleImageViewer image={m!.imageData} />
          </Box>
        ))}
      </HStack>
    );
  else if (length === 3)
    return (
      <VStack space="xs" className="w-full">
        <Box className="h-48 w-full">
          <SingleImageViewer image={media[0]!.imageData} />
        </Box>
        <HStack space="xs" className="h-32 w-full">
          {media.slice(1).map((m) => (
            <Box key={m.id} className="flex-1">
              <SingleImageViewer image={m!.imageData} />
            </Box>
          ))}
        </HStack>
      </VStack>
    );
  else
    return (
      <VStack space="xs" className="w-full">
        <Box className="h-48 w-full">
          <SingleImageViewer image={media[0]!.imageData} />
        </Box>
        <HStack space="xs" className="h-32 w-full">
          <SingleImageViewer className="flex-1" image={media[1]!.imageData} />
          <Pressable className="flex-1 items-center justify-center">
            <SingleImageViewer className="absolute inset-0" image={media[2]!.imageData} />
            <Box className="absolute inset-0 bg-background-700" style={{ opacity: 0.5 }} />
            <Text size="xl" bold className="text-primary-0">
              +{length - 3}
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    );
}
