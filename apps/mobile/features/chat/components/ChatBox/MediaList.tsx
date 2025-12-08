import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { extractImageData } from '@lactalink/utilities/extractors';
import { XIcon } from 'lucide-react-native';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { CreateChatMessage } from '../../lib/types';

export default function MediaList() {
  const { control, setValue } = useFormContext<CreateChatMessage>();
  const media = useWatch({ name: 'media', control });

  if (!media || media.length === 0) return null;

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={media}
      ItemSeparatorComponent={() => <Box className="w-2" />}
      contentContainerClassName="p-1"
      renderItem={({ item, index }) => {
        const image = extractImageData(item);

        const handleRemove = () => {
          const newMedia = media.filter((_, i) => i !== index);
          setValue('media', newMedia.length > 0 ? newMedia : undefined);
        };

        return (
          <View style={{ paddingRight: 8, paddingTop: 8 }}>
            <Card className="h-24 w-16 rounded-md p-0">
              <SingleImageViewer image={image} />
            </Card>
            <Button
              size="sm"
              action="negative"
              className="absolute right-0 top-0 h-fit w-fit rounded-full p-2"
              onPress={handleRemove}
            >
              <ButtonIcon as={XIcon} />
            </Button>
          </View>
        );
      }}
    />
  );
}
