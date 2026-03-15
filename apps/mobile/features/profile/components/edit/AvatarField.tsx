import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalContent } from '@/components/ui/modal';
import { VStack } from '@/components/ui/vstack';
import { deleteLocalFiles } from '@/lib/utils/deleteLocalFiles';
import { transformImage } from '@/lib/utils/imageProcessors';
import { EditProfileSchema } from '@lactalink/form-schemas';
import { extractErrorMessage, extractImageData } from '@lactalink/utilities/extractors';
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
}

const baseOptions: ImagePickerOptions = {
  allowsEditing: true,
  quality: 1,
  aspect: [1, 1],
  mediaTypes: 'images',
};

export function AvatarField({ control }: AvatarFieldProps) {
  const {
    field: { onChange, onBlur, value: avatar },
  } = useController({ control, name: 'avatar' });

  const [isModalOpen, showModal] = useState(false);

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

  function handleRemove() {
    // Remove local file if exists
    if (avatar && !avatar.url.startsWith('http')) {
      deleteLocalFiles([avatar.url]);
    }
    onChange(null);
  }

  return (
    <>
      <HStack space="lg" className="p-5">
        <Box className="h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-background-200">
          {avatar ? (
            <SingleImageViewer
              image={extractImageData(avatar)}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <Icon as={ImageIcon} size="2xl" className="text-background-0" />
          )}
        </Box>
        <VStack space="md" className="flex-1 items-stretch justify-center px-4">
          <Button onPress={() => showModal(true)}>
            <ButtonText>Change Avatar</ButtonText>
          </Button>
          {avatar && (
            <Button action="negative" variant="outline" onPress={handleRemove}>
              <ButtonText>Remove</ButtonText>
            </Button>
          )}
        </VStack>
      </HStack>
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
