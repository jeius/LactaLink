import { Text } from '@/components/ui/text';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import * as ImagePicker from 'expo-image-picker';

import { MAX_IMAGE_SIZE } from '@/lib/constants';
import { ImageSchema } from '@lactalink/form-schemas';
import { CameraIcon, UploadCloudIcon, UploadIcon } from 'lucide-react-native';
import React, { forwardRef, Ref, useImperativeHandle, useRef, useState } from 'react';
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

  const lastImageUri = useRef<string[]>(
    value?.map((v) => v.url).filter((url) => typeof url === 'string') || []
  );

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

  function handleUpload() {
    if (!isDisabled) showModal(true);
  }

  async function handleRemove(index?: number) {
    // Delete the previously stored image URI if it's a file stored locally
    if (index && lastImageUri.current[index]) {
      deleteLocalFiles([lastImageUri.current[index]]);
    } else {
      deleteLocalFiles(lastImageUri.current);
    }
    lastImageUri.current = [];
  }

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    upload: handleUpload,
    remove: handleRemove,
  }));

  async function handleTransform(
    pickedImage: ImagePicker.ImagePickerAsset,
    fileName?: string
  ): Promise<ImageSchema | undefined> {
    const transformedImage = await transformImage(pickedImage, fileName).catch((err) => {
      toast.error(extractErrorMessage(err));
      return null;
    });

    if (!transformedImage) return undefined;

    // Delete the previously stored image URI if it's a file stored locally
    deleteLocalFiles(lastImageUri.current);

    // Save the current URI for possible future deletion
    lastImageUri.current.push(transformedImage.url);

    return transformedImage;
  }

  async function handleChange(result: ImagePicker.ImagePickerResult) {
    if (!result.canceled && result.assets.length > 0) {
      showModal(false);
      const images = await Promise.all(
        result.assets.map((asset, i) => {
          // If allowsMultipleSelection is false, we only take the first image
          if (!allowsMultipleSelection && i > 0) return undefined;

          return handleTransform(asset, Array.isArray(filename) ? filename[i] : filename);
        })
      );
      // Filter out any undefined results
      const validImages = images.filter((img) => img !== undefined);
      onChange?.(validImages);
    }
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      ...basePickerOptions,
      defaultTab: 'photos',
    });
    await handleChange(result);
  }

  async function pickFromCamera() {
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
