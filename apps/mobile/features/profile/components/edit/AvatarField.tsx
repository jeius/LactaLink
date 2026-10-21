import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalContent } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { transformImage } from '@/lib/utils/imageProcessors';
import { EditProfileSchema } from '@lactalink/form-schemas';
import { extractErrorMessage, extractImageData } from '@lactalink/utilities/extractors';
import { Image } from 'expo-image';
import {
  CameraType,
  ImagePickerOptions,
  ImagePickerResult,
  launchCameraAsync,
  launchImageLibraryAsync,
} from 'expo-image-picker';
import { CameraIcon, ImageIcon, UploadIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { toast } from 'sonner-native';

interface AvatarFieldProps {
  control: Control<EditProfileSchema>;
  name?: string;
}

const baseOptions: ImagePickerOptions = {
  allowsEditing: true,
  quality: 1,
  aspect: [1, 1],
  mediaTypes: 'images',
};

export function AvatarField({ control, name = 'Profile' }: AvatarFieldProps) {
  const {
    field: { onChange, onBlur, value: avatar },
  } = useController({ control, name: 'avatar' });

  const [isModalOpen, showModal] = useState(false);
  const avatarUri = avatar ? extractImageData(avatar)?.uri || undefined : undefined;

  async function handleChange(result: ImagePickerResult) {
    if (!result.canceled && result.assets[0]) {
      showModal(false);
      onBlur();

      const transformedImage = await transformImage(result.assets[0]).catch((err) => {
        toast.error(extractErrorMessage(err));
        return null;
      });

      if (!transformedImage) return;
      onChange(transformedImage);
    }
  }

  async function pickFromLibrary() {
    const result = await launchImageLibraryAsync({
      ...baseOptions,
      defaultTab: 'photos',
    });
    await handleChange(result);
  }

  async function pickFromCamera() {
    const result = await launchCameraAsync({
      ...baseOptions,
      cameraType: CameraType.front,
    });
    await handleChange(result);
  }

  return (
    <>
      <Box className="relative mb-16 h-48 overflow-visible bg-primary-100">
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" blurRadius={5} accessibilityLabel="Profile cover" />
        ) : (
          <Box className="h-full w-full bg-primary-100" />
        )}
        <Box className="absolute inset-0 bg-primary-100 opacity-25" />
        <Box className="absolute left-1/2 top-28 h-36 w-36 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-8 border-background-50 bg-background-200">
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              accessibilityLabel="Selected avatar preview"
            />
          ) : (
            <Icon as={ImageIcon} size="2xl" className="text-primary-400" />
          )}
        </Box>
        <Button onPress={() => showModal(true)} className="absolute left-1/2 top-52 h-11 w-11 -translate-x-1/2 rounded-full border-4 border-background-50 p-0"><ButtonIcon as={CameraIcon} /></Button>
        <Box className="absolute left-4 top-3 rounded-full bg-background-0 px-3 py-1">
          <Text className="font-JakartaSemiBold text-primary-800">{name}</Text>
        </Box>
      </Box>
      <Modal isOpen={isModalOpen} closeOnOverlayClick onClose={() => showModal(false)}>
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
}
