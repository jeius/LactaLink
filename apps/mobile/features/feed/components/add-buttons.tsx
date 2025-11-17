import { useForm } from '@/components/contexts/FormProvider';
import { Button, ButtonText } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  Popover,
  PopoverArrow,
  PopoverBackdrop,
  PopoverBody,
  PopoverContent,
} from '@/components/ui/popover';
import { Pressable } from '@/components/ui/pressable';
import { type PostSchema } from '@lactalink/form-schemas';
import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker';
import { CameraIcon, ImageIcon, PlusCircleIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { transformPickerResult } from '../lib/transformPickerResult';
import AttachmentSheet from './AttachmentSheet';

export function ImagePickerButton() {
  const { setValue, control } = useForm<PostSchema>();
  const media = useWatch({ control, name: 'media' });

  const handlePress = async () => {
    const pickerResult = await launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
    });

    const transformedImage = await transformPickerResult(pickerResult);
    if (!transformedImage) return;

    const options = { shouldDirty: true, shouldTouch: true };
    if (media && media.length > 0) {
      setValue('media', [...media, { image: transformedImage }], options);
    } else {
      setValue('media', [{ image: transformedImage }], options);
    }
  };

  return (
    <Pressable className="overflow-hidden rounded-xl p-2" onPress={handlePress}>
      <Icon as={ImageIcon} size="2xl" className="text-primary-700" />
    </Pressable>
  );
}

export function CameraButton() {
  const { setValue, control } = useForm<PostSchema>();
  const media = useWatch({ control, name: 'media' });

  const handlePress = async () => {
    const pickerResult = await launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
    });

    const transformedImage = await transformPickerResult(pickerResult);
    if (!transformedImage) return;

    const options = { shouldDirty: true, shouldTouch: true };
    if (media && media.length > 0) {
      setValue('media', [...media, { image: transformedImage }], options);
    } else {
      setValue('media', [{ image: transformedImage }], options);
    }
  };

  return (
    <Pressable className="overflow-hidden rounded-xl p-2" onPress={handlePress}>
      <Icon as={CameraIcon} size="2xl" className="text-primary-700" />
    </Pressable>
  );
}

export function AddAttachmentButton() {
  const [openPopover, setOpenPopover] = useState(false);
  const [collection, setCollection] = useState<'donations' | 'requests'>();
  const [openSheet, setOpenSheet] = useState(false);

  const handleSelect = (type: 'donations' | 'requests') => {
    setCollection(type);
    setOpenPopover(false);
    setOpenSheet(true);
  };

  return (
    <>
      <Popover
        size="md"
        isOpen={openPopover}
        onOpen={() => setOpenPopover(true)}
        onClose={() => setOpenPopover(false)}
        placement="top"
        trigger={(props, { open }) => (
          <Pressable
            {...props}
            className={`overflow-hidden rounded-xl p-2 ${open ? 'bg-background-200' : ''}`}
          >
            <Icon as={PlusCircleIcon} size="2xl" className="text-primary-700" />
          </Pressable>
        )}
      >
        <PopoverBackdrop />
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody className="flex-col space-y-4">
            <Button variant="outline" onPress={() => handleSelect('donations')}>
              <ButtonText>Add a donation</ButtonText>
            </Button>
            <Button variant="outline" className="mt-4" onPress={() => handleSelect('requests')}>
              <ButtonText>Add a request</ButtonText>
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <AttachmentSheet collection={collection} isOpen={openSheet} setOpen={setOpenSheet} />
    </>
  );
}
