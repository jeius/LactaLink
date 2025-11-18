import { useForm } from '@/components/contexts/FormProvider';
import { Image } from '@/components/Image';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { FaceOutlineIcon } from '@/components/ui/icon/custom';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { submitVerification } from '@/features/id-verification/lib/submit';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { transformImage } from '@/lib/utils/imageProcessors';
import { IdentitySchema } from '@lactalink/form-schemas';
import { extractErrorMessage } from '@lactalink/utilities/extractors';

import { CameraCapturedPicture, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner-native';

export default function FaceVerificationPage() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const camRef = useRef<CameraView>(null);

  const router = useRouter();

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<IdentitySchema>();

  const revalidate = useRevalidateCollectionQueries();

  async function onSubmit(data: IdentitySchema) {
    const promise = submitVerification(data);

    toast.promise(promise, {
      loading: 'Submitting verification...',
      success: (res: { message: string }) => res.message,
      error: (error) => extractErrorMessage(error),
    });

    await promise;

    setPhoto(null);
    revalidate('identities');

    router.dismissTo('/id-verification');
  }

  async function handleCapture() {
    if (!camRef.current || !cameraReady) return;

    const photo = await camRef.current.takePictureAsync({ quality: 1 }).catch((err) => {
      toast.error('Failed to capture photo. Please try again.');
      return null;
    });

    if (!photo) return;

    const fileName = photo.uri.split('/').pop() || 'face.jpg';
    const image = await transformImage({ uri: photo.uri, fileName }).catch((err) => {
      toast.error(extractErrorMessage(err));
      return null;
    });

    if (!image) return;

    setValue('faceImage', image, { shouldValidate: true, shouldDirty: true });
    setPhoto(photo);

    handleSubmit(onSubmit)();
  }

  if (!permission) {
    // Camera permissions are still loading.
    return <LoadingSpinner />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeArea mode="margin" safeTop={false} className="gap-5 p-5">
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission}>
          <ButtonText>Grant Permission</ButtonText>
        </Button>
      </SafeArea>
    );
  }

  return (
    <SafeArea mode="margin" safeTop={false} className="items-stretch p-5">
      <VStack space="xl" className="flex-1 items-center">
        <Text className="text-center font-JakartaMedium">
          Align your face with the guide and press the button to capture and submit the
          verification.
        </Text>

        <Box
          className="relative overflow-hidden rounded-full"
          style={{ width: '85%', aspectRatio: 1 }}
        >
          {!photo ? (
            <>
              <CameraView
                ref={camRef}
                style={{ width: '100%', height: '100%' }}
                facing="front"
                onCameraReady={() => setCameraReady(true)}
                ratio="1:1"
              />
              <Box className="absolute inset-6 items-center justify-center">
                <Icon as={FaceOutlineIcon} className="h-full w-full stroke-1 text-primary-400" />
              </Box>
            </>
          ) : (
            <Image
              source={{ uri: photo.uri, width: photo.width, height: photo.height }}
              alt="Face Image"
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          )}
        </Box>
      </VStack>
      <Button onPress={handleCapture} isDisabled={!cameraReady || isSubmitting}>
        <ButtonText>Submit</ButtonText>
      </Button>
    </SafeArea>
  );
}
