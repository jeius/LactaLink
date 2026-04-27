import { useForm } from '@/components/contexts/FormProvider';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ActionSheet } from '@/components/ui/sheet';
import { type PostSchema } from '@lactalink/form-schemas';
import { randomUUID } from 'expo-crypto';
import { ImagePickerResult, launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker';
import { CameraIcon, ImageIcon, PlusCircleIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { transformPickerResult } from '../../lib/transformPickerResult';
import AttachmentSheet from './AttachmentSheet';

const useMediaField = () => {
  const { setValue, control } = useForm<PostSchema>();
  const media = useWatch({ control, name: 'media' });

  const addMedia = useCallback(
    async (pickerResult: ImagePickerResult) => {
      const transformedImages = await transformPickerResult(pickerResult);
      if (!transformedImages) return;

      const options = { shouldDirty: true, shouldTouch: true };
      const imagesToAdd = transformedImages
        .filter((img) => img !== null)
        .map((img) => ({ image: img, id: `temp-${randomUUID()}` }));

      if (media && media.length > 0) {
        setValue('media', [...media, ...imagesToAdd], options);
      } else {
        setValue('media', imagesToAdd, options);
      }
    },
    [media, setValue]
  );

  return { media, addMedia };
};

export function ImagePickerButton() {
  const { addMedia } = useMediaField();

  const handlePress = async () => {
    const pickerResult = await launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    await addMedia(pickerResult);
  };

  return (
    <Pressable className="overflow-hidden rounded-xl p-2" onPress={handlePress}>
      <Icon as={ImageIcon} size="2xl" className="text-primary-700" />
    </Pressable>
  );
}

export function CameraButton() {
  const { addMedia } = useMediaField();

  const handlePress = async () => {
    const pickerResult = await launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
    });

    await addMedia(pickerResult);
  };

  return (
    <Pressable className="overflow-hidden rounded-xl p-2" onPress={handlePress}>
      <Icon as={CameraIcon} size="2xl" className="text-primary-700" />
    </Pressable>
  );
}

export function AddAttachmentButton() {
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [collection, setCollection] = useState<'donations' | 'requests'>();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSelect = (type: 'donations' | 'requests') => {
    setCollection(type);
    setIsActionOpen(false);
    setIsSheetOpen(true);
  };

  return (
    <>
      <ActionSheet open={isActionOpen} setOpen={setIsActionOpen}>
        <ActionSheet.Trigger
          className={`overflow-hidden rounded-xl p-2 ${isActionOpen ? 'bg-background-200' : ''}`}
          aria-label="Attach a donation or request"
        >
          <ActionSheet.Icon as={PlusCircleIcon} size="2xl" className="text-primary-700" />
        </ActionSheet.Trigger>

        <ActionSheet.Content>
          <Heading size="md" className="px-4 pb-1">
            What would you like to attach?
          </Heading>
          <ActionSheet.Item onPress={() => handleSelect('donations')} aria-label="Add a donation">
            <ActionSheet.ItemText className="font-JakartaSemiBold">Donation</ActionSheet.ItemText>
          </ActionSheet.Item>
          <ActionSheet.Item onPress={() => handleSelect('requests')} aria-label="Add a request">
            <ActionSheet.ItemText className="font-JakartaSemiBold">Request</ActionSheet.ItemText>
          </ActionSheet.Item>
        </ActionSheet.Content>
      </ActionSheet>

      <AttachmentSheet collection={collection} isOpen={isSheetOpen} setOpen={setIsSheetOpen} />
    </>
  );
}
