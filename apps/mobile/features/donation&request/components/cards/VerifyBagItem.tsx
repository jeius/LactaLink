import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card, CardProps } from '@/components/ui/card';
import { ImageGradientOverlay } from '@/components/ui/gradient-bg';
import { Modal, ModalBackdrop, ModalBody, ModalContent } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { deleteLocalFiles } from '@/lib/utils/deleteLocalFiles';
import { transformImage } from '@/lib/utils/imageProcessors';

import { ImageSchema, MilkBagSchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';

import * as ImagePicker from 'expo-image-picker';

import { HStack } from '@/components/ui/hstack';
import { displayVolume } from '@lactalink/utilities';
import { CameraIcon, ImageIcon, RefreshCcwIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner-native';
import { useUploadBagImageMutation } from '../../hooks/mutations';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  allowsEditing: true,
  aspect: [1, 1],
  mediaTypes: 'images',
  allowsMultipleSelection: false,
  cameraType: ImagePicker.CameraType.back,
};

interface MilkBagCardProps extends CardProps {
  data: MilkBagSchema;
  onImageCapture?: (image: ImageSchema) => void;
  onChange?: (data: MilkBagSchema) => void;
}

export default function VerifyBagItem({
  data,
  onImageCapture,
  onChange,
  ...props
}: MilkBagCardProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  const { code = 'Unavailable', volume, collectedAt } = data;

  const bagImage = data.bagImage;
  const imageUrl = bagImage?.url;
  const imageAlt = bagImage?.alt || 'Milk Bag Image';

  const prevImageUriRef = useRef<string | null>(null);
  const [localImageUri, setLocalImageUri] = useState<string | null>(imageUrl ?? null);

  const { mutate: uploadImage, isPending: isUploading } = useUploadBagImageMutation(data, onChange);

  const deletePrev = useCallback(async () => {
    const prevUri = prevImageUriRef.current;
    if (prevUri) deleteLocalFiles([prevUri]);
  }, []);

  useEffect(() => {
    return () => {
      deletePrev();
    };
  }, [deletePrev]);

  async function processResult(result: ImagePicker.ImagePickerResult) {
    if (result.canceled || result.assets.length === 0) return;

    const rawImage = result.assets[0];
    if (!rawImage) return;

    setLocalImageUri(rawImage.uri);
    const filename = `${code}-${volume}ml-image`;
    const transformed = await transformImage(rawImage, filename);

    deletePrev();
    onImageCapture?.({ ...transformed, alt: 'Milk Bag Image' });
    uploadImage({ ...transformed, alt: 'Milk Bag Image' });
    setModalOpen(false);
    prevImageUriRef.current = rawImage.uri;
  }

  async function handleCapture() {
    try {
      const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
      processResult(result);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function handleUpload() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      processResult(result);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  return (
    <Card {...props} style={{ maxWidth: 320, padding: 0 }}>
      <Box className="relative w-full overflow-hidden bg-primary-0" style={{ aspectRatio: 1.5 }}>
        {localImageUri ? (
          <Image
            source={{ uri: localImageUri }}
            alt={imageAlt}
            placeholder={{ blurhash: bagImage?.blurhash }}
            style={{ flexGrow: 1 }}
            contentFit="cover"
          />
        ) : (
          <Text className="grow text-center align-middle">Unverified</Text>
        )}

        {bagImage && <ImageGradientOverlay />}

        <HStack className="absolute inset-x-0 bottom-0 items-center bg-background-0/60 p-2">
          <VStack space="xs" className="flex-1">
            <Text size="xs">Collected At:</Text>
            <Text size="sm" numberOfLines={1} className="font-JakartaMedium">
              {formatDate(collectedAt, { shortMonth: true })}, {formatLocaleTime(collectedAt)}
            </Text>
          </VStack>

          <Text size="xl" bold className="">
            {displayVolume(volume)}
          </Text>
        </HStack>
      </Box>

      <VStack space="md" className="p-4">
        <Text size="lg" bold className="text-center">
          Code: {code}
        </Text>

        <Button variant="outline" isDisabled={isUploading} onPress={() => setModalOpen(true)}>
          {isUploading ? (
            <ButtonSpinner />
          ) : (
            <ButtonIcon as={bagImage ? RefreshCcwIcon : CameraIcon} />
          )}
          <ButtonText>{bagImage ? 'Change photo' : 'Capture a photo'}</ButtonText>
        </Button>
      </VStack>

      <Modal
        isOpen={isModalOpen}
        closeOnOverlayClick
        onClose={() => {
          setModalOpen(false);
        }}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalBody className="my-auto">
            <VStack space="lg">
              <Button onPress={handleCapture}>
                <ButtonIcon as={CameraIcon} />
                <ButtonText>Open Camera</ButtonText>
              </Button>
              <Button variant="outline" onPress={handleUpload}>
                <ButtonIcon as={ImageIcon} />
                <ButtonText>Choose from library</ButtonText>
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
}
