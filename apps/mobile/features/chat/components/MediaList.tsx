import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageSchema } from '@lactalink/form-schemas';
import { extractImageData } from '@lactalink/utilities/extractors';
import { XIcon } from 'lucide-react-native';
import React from 'react';
import { FlatList } from 'react-native-gesture-handler';

interface MediaListProps {
  media: ImageSchema[];
  setMedia: (media: ImageSchema[]) => void;
}

export default function MediaList({ media, setMedia }: MediaListProps) {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={media}
      ItemSeparatorComponent={() => <Box className="w-2" />}
      contentContainerClassName="p-1"
      renderItem={({ item, index }) => {
        const image = extractImageData(item);

        function handleRemove() {
          const newMedia = [...media];
          newMedia.splice(index, 1);
          setMedia(newMedia);
        }

        return (
          <Box style={{ paddingRight: 8, paddingTop: 8 }}>
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
          </Box>
        );
      }}
    />
  );
}
