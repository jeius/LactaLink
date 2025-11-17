import { useForm } from '@/components/contexts/FormProvider';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { MediaSchema, PostSchema } from '@lactalink/form-schemas';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useWindowDimensions } from 'react-native';

export default function MediaList() {
  const { control, setValue } = useForm<PostSchema>();
  const media = useWatch({ control, name: 'media' });

  if (!media || media.length === 0) return null;

  const remove = (index: number) => {
    const updatedMedia = [...media];
    updatedMedia.splice(index, 1);
    setValue('media', updatedMedia, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <VStack className="items-stretch">
      <FlashList
        horizontal
        pagingEnabled
        data={media}
        contentContainerClassName="px-4 py-2 items-stretch"
        ItemSeparatorComponent={() => <Box className="w-4" />}
        renderItem={({ item, index }) => (
          <MediaListItem
            item={item}
            index={index}
            control={control}
            onRemove={() => remove(index)}
          />
        )}
      />
    </VStack>
  );
}

function MediaListItem({
  item: { image, caption },
  onRemove,
  control,
  index,
}: {
  item: MediaSchema;
  onRemove: () => void;
  control: Control<PostSchema>;
  index: number;
}) {
  const { width } = useWindowDimensions();

  return (
    <Card className="p-0">
      <SingleImageViewer
        image={{ uri: image.url, blurHash: image.blurhash, alt: image.alt }}
        style={{ width, maxWidth: 320, aspectRatio: 1.75 }}
      />
      <TextAreaField
        control={control}
        name={`media.${index}`}
        textareaProps={{ containerClassName: 'h-24 w-auto m-3', placeholder: 'Add a caption...' }}
      />
    </Card>
  );
}
