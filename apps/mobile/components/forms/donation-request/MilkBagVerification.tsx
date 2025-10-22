import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { useForm } from '@/components/contexts/FormProvider';
import { HintAlert } from '@/components/HintAlert';
import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { Modal, ModalBackdrop, ModalBody, ModalContent } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { MMKV_KEYS } from '@/lib/constants';
import localStorage from '@/lib/localStorage';

import { DonationSchema, ImageSchema, MilkBagSchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';

import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { CameraIcon, ImageIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { toast } from 'sonner-native';

export default function MilkBagVerification() {
  const hasViewedHint = localStorage.getBoolean(MMKV_KEYS.ALERT.MILKBAG_VERIFICATION);
  const [showHint, setShowHint] = React.useState(!hasViewedHint);

  const { setValue, control } = useForm<DonationSchema>();

  const milkBags = useWatch({ control, name: 'milkBags' }) || [];

  function handleHintClose() {
    localStorage.set(MMKV_KEYS.ALERT.MILKBAG_VERIFICATION, true);
    setShowHint(true);
  }

  function renderCard(bag: MilkBagSchema, idx: number) {
    function handleOnCapture(image: ImageSchema) {
      setValue(`milkBags.${idx}.bagImage`, image);
    }

    return <MilkBagCard key={`${bag.id}-${idx}`} data={bag} onImageCapture={handleOnCapture} />;
  }

  return (
    <VStack space="xl" className="flex-1 items-center p-5">
      <HintAlert
        visible={showHint}
        message="Ensure that you affix/write the code to the exact milk bag."
        onClose={handleHintClose}
      />
      {milkBags.map(renderCard)}
    </VStack>
  );
}

interface MilkBagCardProps extends React.ComponentProps<typeof Card> {
  data: MilkBagSchema;
  onImageCapture?: (image: ImageSchema) => void;
}

function MilkBagCard({ data, onImageCapture, ...props }: MilkBagCardProps) {
  const { themeColors } = useTheme();

  const [capturedImage, setCapturedImage] = useState(data.bagImage);
  const [isModalOpen, setModalOpen] = useState(false);

  const { code = 'Unavailable', volume, collectedAt } = data;

  const bagImage = data.bagImage || capturedImage;
  const imageUrl = bagImage?.url;
  const imageAlt = bagImage?.alt || 'Milk Bag Image';

  useEffect(() => {
    setCapturedImage(data.bagImage);
    if (!data.bagImage) {
      deletePrev();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.bagImage]);

  useEffect(() => {
    return () => {
      deletePrev();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChange(rawImage: ImagePicker.ImagePickerAsset | null) {
    if (!rawImage) return;

    const fileExtension = rawImage.fileName?.split('.')?.[1] || 'jpeg';
    const filename = `${code}-${volume}ml-image.${fileExtension}`;

    const transformedImage: ImageSchema = {
      url: rawImage.uri,
      filename,
      mimeType: rawImage.mimeType || 'image/jpeg',
      width: rawImage.width,
      height: rawImage.height,
      alt: 'Milk Bag Image',
      filesize: rawImage.fileSize,
    };

    deletePrev();
    setCapturedImage(transformedImage);
    onImageCapture?.(transformedImage);
    setModalOpen(false);
  }

  async function handleCapture() {
    try {
      const image = await pickFromCamera();
      handleChange(image);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function handleUpload() {
    try {
      const image = await pickFromLibrary();
      handleChange(image);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function deletePrev() {
    try {
      if (capturedImage) {
        const file = new File(capturedImage.url);
        file.delete();
      }
    } catch (error) {
      console.warn('Failed to delete local file:', extractErrorMessage(error));
    }
  }

  return (
    <Card {...props} style={{ maxWidth: 320 }}>
      <VStack space="md" className="items-stretch">
        <Box
          className="bg-primary-0 relative w-full overflow-hidden rounded-xl"
          style={{ aspectRatio: 1.5 }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              alt={imageAlt}
              style={{ flexGrow: 1 }}
              contentFit="cover"
            />
          ) : (
            <Text className="grow text-center align-middle">Unverified</Text>
          )}

          {bagImage && <GradientBackground colors={['transparent', themeColors.primary[0]!]} />}

          <VStack className="absolute inset-x-0 bottom-0 items-start justify-between px-4 py-2">
            <Text className="font-JakartaSemiBold">{volume} mL</Text>
            <Text size="sm" className="text-typography-800 font-JakartaMedium">
              {formatDate(collectedAt, { shortMonth: true })}, {formatLocaleTime(collectedAt)}
            </Text>
          </VStack>
        </Box>

        <Text size="lg" bold className="text-center">
          Code: {code}
        </Text>

        <Button variant="outline" onPress={() => setModalOpen(true)}>
          <ButtonIcon as={CameraIcon} />
          <ButtonText>{bagImage ? 'Retake photo' : 'Take a photo'}</ButtonText>
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
              <Button variant="outline" onPress={handleCapture}>
                <ButtonIcon as={CameraIcon} />
                <ButtonText>Open Camera</ButtonText>
              </Button>
              <Button onPress={handleUpload}>
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

async function pickFromCamera() {
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.75,
    aspect: [1, 1],
    mediaTypes: 'images',
    allowsMultipleSelection: false,
    cameraType: ImagePicker.CameraType.back,
  });

  if (!result.canceled && result.assets.length > 0) {
    const image = result.assets[0]!;
    return image;
  }
  return null;
}

async function pickFromLibrary() {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 0.75,
    aspect: [1, 1],
    mediaTypes: 'images',
    allowsMultipleSelection: false,
    cameraType: ImagePicker.CameraType.back,
  });

  if (!result.canceled && result.assets.length > 0) {
    const image = result.assets[0]!;
    return image;
  }
  return null;
}
