import { Text } from '@/components/ui/text';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import * as crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { MAX_IMAGE_SIZE } from '@/lib/constants';
import { ImageSchema } from '@lactalink/types';
import { CameraIcon, UploadCloudIcon, UploadIcon } from 'lucide-react-native';
import React, { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react';
import { Box } from './ui/box';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Icon } from './ui/icon';
import { Pressable } from './ui/pressable';
import { VStack } from './ui/vstack';

import { Modal, ModalBackdrop, ModalBody, ModalContent } from '@/components/ui/modal';
import { toast } from 'sonner-native';

const containerStyle = tva({
  base: 'h-64 w-full',
});

const pressableStyle = tva({
  base: 'border-primary-500 bg-primary-0 grow flex-col items-center justify-center rounded-xl border border-dashed',
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
  containerClassName?: string;
  render?: (value: ImageSchema[]) => React.ReactNode;
  isDisabled?: boolean;
}

const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(function ImageUpload(
  {
    containerClassName,
    onChange,
    value,
    allowsMultipleSelection = false,
    selectionLimit = 1,
    render,
    maxFileSize = MAX_IMAGE_SIZE,
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

  const Render = value && render ? render(value) : null;

  const lastImageUri = useRef<string[] | null>(
    value?.map((v) => v?.url).filter((url): url is string => typeof url === 'string') || null
  );

  const localDir = FileSystem.documentDirectory!;

  const basePickerOptions: ImagePicker.ImagePickerOptions = {
    ...props,
    allowsEditing: !allowsMultipleSelection && allowsEditing,
    quality,
    aspect,
    mediaTypes: 'images',
    selectionLimit: selectionLimit,
    allowsMultipleSelection: allowsMultipleSelection,
    orderedSelection,
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    upload: handleUpload,
    remove: handleRemove,
  }));

  async function deleteLocalFiles(uris: string[]) {
    await Promise.all(
      uris.map(async (uri) => {
        if (uri.startsWith(localDir)) {
          try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          } catch (error) {
            console.warn('Failed to delete local file:', error);
          }
        }
      })
    );
  }

  function handleUpload() {
    if (!isDisabled) showModal(true);
  }

  async function handleRemove(index?: number) {
    // Delete the previously stored image URI if it's a file stored locally
    if (lastImageUri.current) {
      if (index && lastImageUri.current[index]) {
        await deleteLocalFiles([lastImageUri.current[index]]);
      } else {
        await deleteLocalFiles(lastImageUri.current);
      }
    }
    lastImageUri.current = null;
  }

  async function transformImage(
    pickedImage: ImagePicker.ImagePickerAsset,
    fileName?: string
  ): Promise<ImageSchema | undefined> {
    if (pickedImage.fileSize && pickedImage.fileSize > maxFileSize) {
      toast.error(`Image size exceeds the maximum limit of ${maxFileSize / 1024 / 1024}MB.`);
      return;
    }

    // Delete the previously stored image URI if it's a file stored locally
    if (lastImageUri.current) {
      await deleteLocalFiles(lastImageUri.current);
    }

    // Save the current URI for possible future deletion
    lastImageUri.current?.push(pickedImage.uri);

    const id = crypto.randomUUID();
    const type = pickedImage.mimeType || 'image/jpeg';
    const name =
      (fileName && `${fileName}.${type.split('/').pop() || 'jpg'}`) ||
      pickedImage.fileName ||
      `${id}.${type.split('/').pop() || 'jpg'}`;

    return {
      filename: name,
      mimeType: type,
      filesize: pickedImage.fileSize,
      width: pickedImage.width,
      height: pickedImage.height,
      url: pickedImage.uri,
    };
  }

  async function handleChange(result: ImagePicker.ImagePickerResult) {
    if (!result.canceled && result.assets.length > 0) {
      showModal(false);
      const images = await Promise.all(
        result.assets.map((asset, i) => {
          // If allowsMultipleSelection is false, we only take the first image
          if (!allowsMultipleSelection && i > 0) return undefined;

          return transformImage(asset, Array.isArray(filename) ? filename[i] : filename);
        })
      );
      // Filter out any undefined results
      const validImages = images.filter((img) => img !== undefined);
      onChange?.(validImages);
    }
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync(basePickerOptions);
    await handleChange(result);
  }

  async function pickFromCamera() {
    const result = await ImagePicker.launchCameraAsync({
      ...basePickerOptions,
      cameraType: ImagePicker.CameraType.front,
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
            <Icon as={UploadCloudIcon} size="2xl" className="text-primary-500 h-16 w-16" />
            <Text size={'md'} className="text-primary-500 font-JakartaMedium">
              Tap to upload
            </Text>
            <Text size="2xs" className="text-typography-500">
              PNG, JPG, WEBP (Max: {maxFileSize / 1024 / 1024}mb)
            </Text>
          </Pressable>
        </Box>
      )}

      {Render}

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
              <Button variant="outline" onPress={pickFromCamera}>
                <ButtonIcon as={CameraIcon} />
                <ButtonText>Camera</ButtonText>
              </Button>
              <Button onPress={pickFromLibrary}>
                <ButtonIcon as={UploadIcon} />
                <ButtonText>Upload</ButtonText>
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
