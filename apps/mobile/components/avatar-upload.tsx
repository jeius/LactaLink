import { Text } from '@/components/ui/text';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import * as crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { useSession } from '@/hooks/auth/useSession';
import { useAppToast } from '@/hooks/useAppToast';
import { MAX_AVATAR_SIZE } from '@/lib/constants';
import { AvatarSchema, SetupProfileSchema } from '@lactalink/types';
import { useQuery } from '@tanstack/react-query';
import { CameraIcon, ImageIcon, UploadCloudIcon, UploadIcon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Box } from './ui/box';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Image } from './ui/image';
import { Pressable } from './ui/pressable';
import { VStack } from './ui/vstack';

import { Modal, ModalBackdrop, ModalBody, ModalContent } from '@/components/ui/modal';

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

export default function AvatarUpload({
  containerClassname,
  onChange,
  value,
  filename: filenameProp,
}: AvatarUploadProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isModalOpen, showModal] = useState(false);

  const toast = useAppToast();
  const { user } = useSession();
  const lastImageUri = useRef<string | null>(value?.url || null);

  const localDir = FileSystem.documentDirectory!;

  const { data: defaultAvatar, refetch } = useQuery<AvatarSchema | undefined>({
    initialData: undefined,
    staleTime: Infinity,
    queryKey: ['avatar', 'download', user?.picture],
    queryFn: async () => {
      if (!user || !user.picture) return;

      const namePrefix = filenameProp?.trim().split('.')[0] || user.email.split('@')[0];
      const filename = `${namePrefix}_avatar.jpeg`;
      const fileUri = localDir + filename;
      const downloaded = await FileSystem.downloadAsync(user.picture, fileUri);

      return {
        id: crypto.randomUUID(),
        filename: filename,
        mimeType: downloaded.mimeType || 'image/jpeg',
        url: downloaded.uri,
      };
    },
  });

  useEffect(() => {
    if (value === undefined && defaultAvatar) {
      onChange?.(defaultAvatar);
    }
  }, [defaultAvatar, onChange, value]);

  async function transformImage(
    pickedImage: ImagePicker.ImagePickerAsset
  ): Promise<AvatarSchema | undefined> {
    if (pickedImage.fileSize && pickedImage.fileSize > MAX_AVATAR_SIZE) {
      toast.show({
        id: 'avatar-image-picker',
        type: 'error',
        message: 'Selected image exceeds the 5MB size limit.',
      });
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
    const namePrefix = filenameProp?.trim().split('.')[0] || user?.email.split('@')[0] || 'temp';
    const filename = namePrefix + `_avatar.${type}`;

    return {
      id: crypto.randomUUID(),
      filename,
      mimeType: pickedImage.mimeType || 'image/jpeg',
      filesize: pickedImage.fileSize,
      width: pickedImage.width,
      height: pickedImage.height,
      url: pickedImage.uri,
    };
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
      mediaTypes: 'images',
    });

    if (!result.canceled) {
      showModal(false);
      const avatar = await transformImage(result.assets[0]);
      if (avatar) onChange?.(avatar);
    }
  }

  async function pickFromCamera() {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
      mediaTypes: 'images',
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled) {
      showModal(false);
      const avatar = await transformImage(result.assets[0]);
      if (avatar) onChange?.(avatar);
    }
  }

  async function useGooglePicture() {
    showModal(false);
    if (onChange) {
      const { data } = await refetch();
      onChange(data);
    }
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
              source={{
                uri: value.url,
                height: value?.height || 300,
                width: value?.width || 300,
              }}
              resizeMethod="scale"
              alt={value?.alt || 'Avatar Image'}
              size="2xl"
              className="mx-auto aspect-square rounded-full"
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
              <Button variant="link" action="secondary" onPress={useGooglePicture}>
                <ButtonIcon as={ImageIcon} />
                <ButtonText>Use Google Picture</ButtonText>
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
