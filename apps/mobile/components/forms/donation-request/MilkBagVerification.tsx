import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { useForm } from '@/components/contexts/FormProvider';
import { HintAlert } from '@/components/HintAlert';
import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { uploadImage } from '@/lib/api/file';

import { MILK_BAG_STATUS, MMKV_KEYS } from '@/lib/constants';

import localStorage from '@/lib/localStorage';
import { useApiClient } from '@lactalink/api';

import { DonationSchema, ImageSchema, MilkBagSchema } from '@lactalink/types';
import {
  extractCollection,
  extractErrorMessage,
  extractID,
  formatDate,
} from '@lactalink/utilities';

import * as ImagePicker from 'expo-image-picker';

import { CameraIcon, CheckIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { toast } from 'sonner-native';

export default function MilkBagVerification() {
  const hasViewedHint = localStorage.getBoolean(MMKV_KEYS.ALERT.MILKBAG_VERIFICATION);
  const [showHint, setShowHint] = React.useState(!hasViewedHint);

  const form = useForm<DonationSchema>();

  const milkBags = form.getValues('milkBags');

  const bags = Object.values(milkBags).flat();

  function handleHintClose() {
    localStorage.set(MMKV_KEYS.ALERT.MILKBAG_VERIFICATION, true);
    setShowHint(true);
  }

  function renderCard(bag: MilkBagSchema, idx: number) {
    function handleVerify(verifiedBag: MilkBagSchema) {}
    return <MilkBagCard key={`${bag.id}-${idx}`} data={bag} />;
  }

  return (
    <VStack space="xl" className="flex-1 items-stretch p-5">
      <HintAlert
        visible={showHint}
        message="Ensure that you affix/write the code to the exact milk bag."
        onClose={handleHintClose}
      />
      <HStack space="xl" className="flex-1 flex-wrap items-center justify-center">
        {bags.map(renderCard)}
      </HStack>
    </VStack>
  );
}

interface MilkBagCardProps extends React.ComponentProps<typeof Card> {
  data: MilkBagSchema;
  onVerify?: (verifiedBag: MilkBagSchema) => void;
  isLoading?: boolean;
}
function MilkBagCard({ data, onVerify, isLoading: isLoadingProp, ...props }: MilkBagCardProps) {
  const apiClient = useApiClient();
  const { themeColors } = useTheme();

  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedImage, setCapturedImage] = useState<ImageSchema>();

  const { code = 'Unavailable', volume, collectedAt, status } = data;

  const bagImage = data.bagImage || capturedImage;
  const imageUrl = bagImage?.url;
  const imageAlt = bagImage?.alt || 'Milk Bag Image';

  const verified = status === MILK_BAG_STATUS.AVAILABLE.value;

  async function handleCapture() {
    try {
      const rawImage = await pickFromCamera();

      if (!rawImage) return;

      const transformedImage: ImageSchema = {
        url: rawImage.uri,
        filename: rawImage.fileName || '',
        mimeType: rawImage.type || 'image/jpeg',
        width: rawImage.width,
        height: rawImage.height,
        alt: 'Milk Bag Image',
        filesize: rawImage.fileSize,
      };
      setCapturedImage(transformedImage);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }

  async function handleVerify() {
    setIsVerifying(true);

    try {
      if (!capturedImage) {
        throw new Error('Please capture an image first.');
      }

      const imageDoc = await uploadImage('milk-bag-images', capturedImage);

      const verifiedBag = await apiClient
        .updateByID({
          collection: 'milkBags',
          id: data.id,
          data: {
            bagImage: imageDoc.id,
            status: MILK_BAG_STATUS.AVAILABLE.value,
          },
          depth: 3,
          select: {
            bagImage: true,
            code: true,
            volume: true,
            collectedAt: true,
            donor: true,
            status: true,
          },
        })
        .finally(() => setIsVerifying(false));

      const verifiedBagImage = extractCollection(verifiedBag.bagImage);

      const transformedBag: MilkBagSchema = {
        ...verifiedBag,
        donor: extractID(verifiedBag.donor),
        bagImage: capturedImage,
      };
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsVerifying(false);
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

        {!bagImage ? (
          <Button variant="outline" onPress={handleCapture}>
            <ButtonIcon as={CameraIcon} />
            <ButtonText>Take a photo</ButtonText>
          </Button>
        ) : (
          <Button
            disabled={verified}
            action="positive"
            variant={verified ? 'solid' : 'outline'}
            onPress={handleVerify}
          >
            {verified && <ButtonIcon as={CheckIcon} />}
            {!verified && isVerifying && <ButtonSpinner />}
            <ButtonText>{verified ? 'Verified' : 'Verify'}</ButtonText>
          </Button>
        )}
      </VStack>
    </Card>
  );
}

async function pickFromCamera() {
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.75,
    aspect: [3, 2],
    mediaTypes: 'images',
    allowsMultipleSelection: false,
    cameraType: ImagePicker.CameraType.front,
  });

  if (!result.canceled && result.assets.length > 0) {
    const image = result.assets[0]!;
    return image;
  }
  return null;
}
