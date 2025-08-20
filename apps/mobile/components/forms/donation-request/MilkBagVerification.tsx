import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { useForm } from '@/components/contexts/FormProvider';
import { HintAlert } from '@/components/HintAlert';
import { Image } from '@/components/Image';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Modal, ModalBackdrop, ModalBody, ModalContent } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { MMKV_KEYS } from '@/lib/constants';

import localStorage from '@/lib/localStorage';

import { DonationSchema, ImageSchema, MilkBagSchema } from '@lactalink/types';
import { extractErrorMessage, formatDate } from '@lactalink/utilities';

import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { CameraIcon, ChevronDownIcon, ChevronUpIcon, ImageIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { toast } from 'sonner-native';

export default function MilkBagVerification() {
  const hasViewedHint = localStorage.getBoolean(MMKV_KEYS.ALERT.MILKBAG_VERIFICATION);
  const [showHint, setShowHint] = React.useState(!hasViewedHint);

  const form = useForm<DonationSchema>();

  const milkBags = form.watch('milkBags');

  const bags = Object.entries(milkBags);

  function handleHintClose() {
    localStorage.set(MMKV_KEYS.ALERT.MILKBAG_VERIFICATION, true);
    setShowHint(true);
  }

  function renderCard([groupID, bags]: [string, MilkBagSchema[]]) {
    const quantity = bags.length;
    const volume = bags[0]?.volume || 0;
    const collectedAt = bags[0]?.collectedAt || new Date().toISOString();
    const date = formatDate(collectedAt);
    const time = new Date(collectedAt).toLocaleTimeString('en', {
      hour: '2-digit',
      minute: '2-digit',
    });

    function handleOnCapture(index: number) {
      return (image: ImageSchema) => {
        form.setValue(`milkBags.${groupID}.${index}.bagImage`, image);
      };
    }

    return (
      <AccordionItem value={groupID} key={groupID}>
        <AccordionHeader>
          <AccordionTrigger className="px-0">
            {({ isExpanded }: { isExpanded: boolean }) => {
              return (
                <>
                  <AccordionTitleText className="font-JakartaSemiBold">
                    {volume} mL, {time}, {date} {`(${quantity})`}
                  </AccordionTitleText>
                  {isExpanded ? (
                    <AccordionIcon as={ChevronUpIcon} className="ml-3" />
                  ) : (
                    <AccordionIcon as={ChevronDownIcon} className="ml-3" />
                  )}
                </>
              );
            }}
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <HStack space="md" className="flex-wrap items-center justify-center">
            {bags.map((bag, bagIdx) => (
              <MilkBagCard
                key={`${bag.id}-${groupID}`}
                data={bag}
                onImageCapture={handleOnCapture(bagIdx)}
              />
            ))}
          </HStack>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <VStack space="xl" className="flex-1 items-stretch p-5">
      <HintAlert
        visible={showHint}
        message="Ensure that you affix/write the code to the exact milk bag."
        onClose={handleHintClose}
      />
      <Accordion variant="unfilled" type="multiple" defaultValue={Object.keys(bags)}>
        {bags.map(renderCard)}
      </Accordion>
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

    if (capturedImage) {
      deletePrev(capturedImage.url);
    }

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

  async function deletePrev(uri: string) {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: false });
    } catch (error) {
      console.warn('Failed to delete local file:', error);
    }
  }

  return (
    <Card {...props}>
      <VStack space="md" className="items-stretch">
        <Box
          className="bg-primary-0 relative w-full overflow-hidden rounded-xl"
          style={{ maxWidth: 260, aspectRatio: 1.5 }}
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

          <HStack
            space="md"
            className="absolute inset-x-0 bottom-0 items-start justify-between px-4 py-2"
          >
            <VStack className="items-start">
              <Text className="text-typography-800 font-JakartaMedium">
                {new Date(collectedAt).toLocaleTimeString('en', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text className="text-typography-800 font-JakartaMedium">
                {formatDate(collectedAt)}
              </Text>
            </VStack>

            <Text className="text-typography-800 font-JakartaMedium">{volume} mL</Text>
          </HStack>
        </Box>

        <Text size="lg" className="font-JakartaSemiBold text-center">
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
