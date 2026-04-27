import { AnimatedPressable } from '@/components/animated/pressable';
import { useForm } from '@/components/contexts/FormProvider';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { MediaSchema, PostSchema } from '@lactalink/form-schemas';
import { XIcon } from 'lucide-react-native';
import { Control, useWatch } from 'react-hook-form';
import { useWindowDimensions } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

export default function MediaList() {
  const { width } = useWindowDimensions();
  const itemWidth = Math.min(width, 320);

  const { control, setValue } = useForm<PostSchema>();
  const media = useWatch({ control, name: 'media' });

  if (!media || media.length === 0) return null;

  const remove = (index: number) => {
    const updatedMedia = [...media];
    updatedMedia.splice(index, 1);
    setValue('media', updatedMedia, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <FlatList
      horizontal
      data={media}
      snapToInterval={itemWidth + 18} // item width + separator width
      showsHorizontalScrollIndicator={false}
      decelerationRate={'fast'}
      snapToAlignment="center"
      contentContainerClassName="p-4 items-stretch grow justify-center"
      getItemLayout={(_, index) => ({
        length: itemWidth,
        offset: (itemWidth + 16) * index,
        index,
      })}
      ItemSeparatorComponent={() => <Box className="w-4" />}
      renderItem={({ item, index }) => (
        <MediaListItem item={item} index={index} control={control} onRemove={remove} />
      )}
    />
  );
}

function MediaListItem({
  item: { image },
  onRemove,
  control,
  index,
}: {
  item: MediaSchema;
  onRemove: (index: number) => void;
  control: Control<PostSchema>;
  index: number;
}) {
  const { width } = useWindowDimensions();

  return (
    <Card className="items-stretch p-0" style={{ width: Math.min(width, 320) }}>
      <Box className="absolute right-0 top-0 z-10 p-3">
        <AnimatedPressable
          className="overflow-hidden rounded-full bg-background-500/70 p-2"
          hitSlop={8}
          onPress={() => onRemove(index)}
        >
          <Icon as={XIcon} className="text-typography-0" />
        </AnimatedPressable>
      </Box>

      <SingleImageViewer
        image={{ uri: image.url, blurHash: image.blurhash, alt: image.alt }}
        style={{ width: '100%', aspectRatio: 1.75 }}
      />
      <TextAreaField
        control={control}
        name={`media.${index}.caption`}
        textareaProps={{
          containerClassName: 'h-24 w-auto m-3',
          placeholder: 'Add a caption...',
        }}
      />
    </Card>
  );
}
