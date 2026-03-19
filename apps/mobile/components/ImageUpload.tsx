import { Text } from '@/components/ui/text';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import * as ImagePicker from 'expo-image-picker';

import { MAX_IMAGE_SIZE } from '@/lib/constants';
import { ImageSchema } from '@lactalink/form-schemas';
import { CameraIcon, ImageIcon, UploadCloudIcon } from 'lucide-react-native';
import React, { forwardRef, Ref, useImperativeHandle, useMemo, useState } from 'react';
import { Box } from './ui/box';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Icon } from './ui/icon';
import { Pressable } from './ui/pressable';
import { VStack } from './ui/vstack';

import { Modal, ModalBackdrop, ModalBody, ModalContent } from '@/components/ui/modal';
import { deleteLocalFiles } from '@/lib/utils/deleteLocalFiles';
import { transformImage } from '@/lib/utils/imageProcessors';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { toast } from 'sonner-native';

const containerStyle = tva({
  base: 'h-64 w-full',
});

const pressableStyle = tva({
  base: 'grow flex-col items-center justify-center rounded-xl border border-dashed border-primary-500 bg-primary-0',
  variants: {
    isPressed: { true: 'opacity-70' },
  },
});

type ImageUploadRef = {
  upload: () => void;
  remove: (index?: number) => Promise<void>;
};

type ImageUploadOptions = Omit<ImagePicker.ImagePickerOptions, 'mediaTypes'> & {
  maxFileSize?: number;
  filename?: string | string[];
};

interface ImageUploadProps extends ImageUploadOptions {
  value?: ImageSchema[] | null;
  onChange?: (val: ImageSchema[]) => void;
  onBlur?: () => void;
  containerClassName?: string;
  render: (value: ImageSchema[]) => React.ReactNode;
  isDisabled?: boolean;
}

const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(function ImageUpload(
  {
    containerClassName,
    onChange,
    value,
    onBlur,
    allowsMultipleSelection = false,
    selectionLimit = 1,
    render,
    aspect = [3, 2],
    quality = 1,
    allowsEditing,
    orderedSelection = true,
    filename,
    isDisabled = false,
    ...props
  }: ImageUploadProps,
  ref: Ref<ImageUploadRef>
) {
  const [isPressed, setIsPressed] = useState(false);
  const [isModalOpen, showModal] = useState(false);

  const RenderComponent = useMemo(() => {
    if (!value) return null;
    return render(value);
  }, [render, value]);

  const basePickerOptions: ImagePicker.ImagePickerOptions = {
    ...props,
    allowsEditing: !allowsMultipleSelection && allowsEditing,
    quality,
    aspect,
    mediaTypes: 'images',
    selectionLimit: Math.max(0, selectionLimit - (value?.length ?? 0)),
    allowsMultipleSelection: allowsMultipleSelection,
    orderedSelection,
  };

  function handleUpload() {
    if (!isDisabled) showModal(true);
  }

  async function handleRemove(index?: number) {
    if (!value) return;
    if (index) {
      onChange?.(value.filter((_, i) => i !== index));
      const valToDelete = value[index];
      if (valToDelete) deleteLocalFiles([valToDelete.url]);
    } else {
      onChange?.([]);
      deleteLocalFiles(value.map((img) => img.url));
    }
  }

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    upload: handleUpload,
    remove: handleRemove,
  }));

  async function handleTransform(
    pickedImage: ImagePicker.ImagePickerAsset,
    fileName?: string
  ): Promise<ImageSchema | null> {
    return transformImage(pickedImage, fileName).catch((err) => {
      toast.error(extractErrorMessage(err));
      return null;
    });
  }

  async function handleChange(result: ImagePicker.ImagePickerResult) {
    if (!result.canceled && result.assets.length > 0) {
      showModal(false);
      onBlur?.();

      const images = await Promise.all(
        result.assets.map((asset, i) => {
          // If allowsMultipleSelection is false, we only take the first image
          if (!allowsMultipleSelection && i > 0) return undefined;
          return handleTransform(asset, Array.isArray(filename) ? filename[i] : filename);
        })
      );

      // Filter out any falsy results
      const validImages = images.filter((img) => !!img);

      if (allowsMultipleSelection) {
        if (value) onChange?.(value.concat(validImages));
        else onChange?.(validImages);
      } else {
        onChange?.(validImages);
      }
    }
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      ...basePickerOptions,
      defaultTab: 'photos',
    });
    await handleChange(result);
  }

  async function captureImage() {
    const result = await ImagePicker.launchCameraAsync({
      ...basePickerOptions,
      cameraType: ImagePicker.CameraType.back,
    });
    await handleChange(result);
  }

  return (
    <>
      {(!value || (Array.isArray(value) && value.length === 0)) && (
        <Box className={containerStyle({ class: containerClassName })}>
          <Pressable
            disabled={isDisabled}
            className={pressableStyle({ isPressed })}
            onPressIn={() => {
              setIsPressed(true);
            }}
            onPressOut={() => {
              setIsPressed(false);
            }}
            onPress={handleUpload}
          >
            <Icon as={UploadCloudIcon} size="2xl" className="h-16 w-16 text-primary-500" />
            <Text className="text-center font-JakartaMedium text-primary-500">Tap to upload</Text>
            <Text size="xs" className="text-center text-typography-700">
              PNG, JPG, WEBP
            </Text>
            <Text size="2xs" className="text-center text-typography-500">
              Image is compressed when size exceeds {MAX_IMAGE_SIZE / 1024 / 1024}MB
            </Text>
          </Pressable>
        </Box>
      )}

      {RenderComponent}

      <Modal
        isOpen={isModalOpen}
        closeOnOverlayClick
        onClose={() => {
          showModal(false);
        }}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalBody className="my-auto">
            <VStack space="lg">
              <Button onPress={captureImage}>
                <ButtonIcon as={CameraIcon} />
                <ButtonText>Open Camera</ButtonText>
              </Button>
              <Button variant="outline" onPress={pickFromLibrary}>
                <ButtonIcon as={ImageIcon} />
                <ButtonText>Choose from library</ButtonText>
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});

ImageUpload.displayName = 'ImageUpload';

export { ImageUpload };
export type { ImageUploadOptions, ImageUploadProps, ImageUploadRef };
