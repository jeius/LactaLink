import { Text } from '@/components/ui/text';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { Image } from '@/components/Image';
import { useAuth } from '@/hooks/auth/useAuth';
import { MAX_IMAGE_SIZE } from '@/lib/constants';
import { ImageSchema, SetupProfileSchema } from '@lactalink/types';
import { useQuery } from '@tanstack/react-query';
import { CameraIcon, ImageIcon, UploadCloudIcon, UploadIcon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Box } from './ui/box';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Pressable } from './ui/pressable';
import { VStack } from './ui/vstack';

import { Modal, ModalBackdrop, ModalBody, ModalContent } from '@/components/ui/modal';
import { showErrorToast } from '@/lib/utils/showErrorToast';
import { sanitizeStringForFilename } from '@lactalink/utilities';

const containerStyle = tva({
  base: 'h-64 w-full',
});

const pressableStyle = tva({
  base: 'border-primary-500 bg-primary-0 grow flex-col items-center justify-center rounded-xl border border-dashed',
  variants: {
    isPressed: { true: 'opacity-70' },
  },
});

export type AvatarUploadProps = {
  value?: SetupProfileSchema['avatar'];
  onChange?: (val: SetupProfileSchema['avatar']) => void;
  containerClassname?: string;
  filename?: string;
};

export function AvatarUpload({
  containerClassname,
  onChange,
  value,
  filename: filenameProp,
}: AvatarUploadProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isModalOpen, showModal] = useState(false);

  const { user } = useAuth();
  const lastImageUri = useRef<string | null>(value?.url || null);

  const baseOptions: ImagePicker.ImagePickerOptions = {
    allowsEditing: true,
    quality: 1,
    aspect: [1, 1],
    mediaTypes: 'images',
  };

  const localDir = FileSystem.documentDirectory!;

  const { data: googlePicture } = useQuery<ImageSchema | null>({
    staleTime: 1000 * 60 * 20, // 20 minutes
    queryKey: ['avatar', 'download', user?.picture],
    queryFn: async () => {
      if (!user || !user.picture) return null;

      const namePrefix =
        (filenameProp && sanitizeStringForFilename(filenameProp)) || user.email.split('@')[0];
      const filename = `${namePrefix}_avatar.jpeg`;
      const fileUri = localDir + filename;
      const downloaded = await FileSystem.downloadAsync(user.picture, fileUri);

      return {
        filename: filename,
        mimeType: downloaded.mimeType || 'image/jpeg',
        url: downloaded.uri,
        alt: 'Google Profile Picture',
      };
    },
  });

  useEffect(() => {
    if (value === undefined && googlePicture) {
      onChange?.(googlePicture);
    }
  }, [googlePicture, onChange, value]);

  async function transformImage(
    pickedImage: ImagePicker.ImagePickerAsset
  ): Promise<ImageSchema | undefined> {
    if (pickedImage.fileSize && pickedImage.fileSize > MAX_IMAGE_SIZE) {
      showErrorToast('Selected image exceeds the 5MB size limit.');
      return;
    }

    // Delete the previously stored image URI if it's a file stored locally
    if (lastImageUri.current && lastImageUri.current.startsWith(localDir)) {
      try {
        await FileSystem.deleteAsync(lastImageUri.current, { idempotent: true });
      } catch (error) {
        console.warn('Failed to delete previous image:', error);
      }
    }

    // Save the current URI for possible future deletion
    lastImageUri.current = pickedImage.uri;

    const type = pickedImage.fileName?.split('.').pop() || 'jpg';
    const namePrefix =
      (filenameProp && sanitizeStringForFilename(filenameProp)) ||
      (user && sanitizeStringForFilename(user.email.split('@')[0] || '')) ||
      'temp';
    const filename = namePrefix + `_avatar.${type}`;

    return {
      filename,
      mimeType: pickedImage.mimeType || 'image/jpeg',
      filesize: pickedImage.fileSize,
      width: pickedImage.width,
      height: pickedImage.height,
      url: pickedImage.uri,
    };
  }

  async function handleChange(result: ImagePicker.ImagePickerResult) {
    if (!result.canceled && result.assets[0]) {
      showModal(false);
      const avatar = await transformImage(result.assets[0]);
      if (avatar) onChange?.(avatar);
    }
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync(baseOptions);
    await handleChange(result);
  }

  async function pickFromCamera() {
    const result = await ImagePicker.launchCameraAsync({
      ...baseOptions,
      cameraType: ImagePicker.CameraType.front,
    });
    await handleChange(result);
  }

  async function useGooglePicture() {
    showModal(false);
    onChange?.(googlePicture);
  }

  async function handleRemove() {
    if (lastImageUri.current && lastImageUri.current.startsWith(localDir)) {
      try {
        await FileSystem.deleteAsync(lastImageUri.current, { idempotent: true });
      } catch (error) {
        console.warn('Failed to delete removed image:', error);
      }
    }
    lastImageUri.current = null;
    onChange?.(null);
  }

  return (
    <Box className={containerStyle({ class: containerClassname })}>
      {!value && (
        <Pressable
          className={pressableStyle({ isPressed })}
          onPressIn={() => {
            setIsPressed(true);
          }}
          onPressOut={() => {
            setIsPressed(false);
          }}
          onPress={() => {
            showModal(true);
          }}
        >
          <Icon as={UploadCloudIcon} size="2xl" className="text-primary-500 h-16 w-16" />
          <Text size={'md'} className="text-primary-500 font-JakartaMedium">
            Tap to upload
          </Text>
          <Text size="2xs" className="text-typography-500">
            PNG, JPG, WEBP (Max: 5mb)
          </Text>
        </Pressable>
      )}

      {value && (
        <VStack space="xl" className="grow items-center justify-center">
          {value.url && (
            <Image
              source={{ uri: value.url }}
              alt={value?.alt || 'Avatar Image'}
              style={{ width: 150, aspectRatio: 1, borderRadius: 9999 }}
            />
          )}
          <HStack space="2xl" className="w-full justify-center">
            <Button
              variant="outline"
              onPress={() => {
                showModal(true);
              }}
            >
              <ButtonText>Change</ButtonText>
            </Button>
            <Button variant="link" action="negative" onPress={handleRemove}>
              <ButtonText>Remove</ButtonText>
            </Button>
          </HStack>
        </VStack>
      )}

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
              {googlePicture && (
                <Button variant="link" action="secondary" onPress={useGooglePicture}>
                  <ButtonIcon as={ImageIcon} />
                  <ButtonText>Use Google Picture</ButtonText>
                </Button>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
