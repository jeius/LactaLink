import { Text } from '@/components/ui/text';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import * as crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';

import { useAppToast } from '@/hooks/useAppToast';
import { MAX_AVATAR_SIZE } from '@/lib/constants';
import { AvatarSchema, SetupProfileSchema } from '@lactalink/types';
import { UploadCloudIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Box } from './ui/box';
import { Button, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Image } from './ui/image';
import { Pressable } from './ui/pressable';
import { VStack } from './ui/vstack';

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
};

export default function AvatarUpload({ containerClassname, onChange, value }: AvatarUploadProps) {
  const [isPressed, setIsPressed] = useState(false);
  const toast = useAppToast();

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
      mediaTypes: 'images',
    });

    const pickedImage = result.assets?.[0];

    if (!pickedImage) return;

    if (pickedImage.fileSize && pickedImage.fileSize > MAX_AVATAR_SIZE) {
      toast.show({
        id: 'avatar-image-picker',
        type: 'error',
        message: 'Selected image exceeds the 5MB size limit.',
      });
      return;
    }

    const avatar: AvatarSchema = {
      id: crypto.randomUUID(),
      filename: pickedImage.fileName,
      filesize: pickedImage.fileSize,
      mimeType: pickedImage.mimeType,
      width: pickedImage.width,
      height: pickedImage.height,
      url: pickedImage.uri,
    };
    onChange?.(avatar);
  }

  function handleRemove() {
    onChange?.(null);
  }

  return (
    <Box className={containerStyle({ class: containerClassname })}>
      {!value && (
        <Pressable
          onPressIn={() => {
            setIsPressed(true);
          }}
          onPressOut={() => {
            setIsPressed(false);
          }}
          onPress={pickImage}
          className={pressableStyle({ isPressed })}
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
          <Image
            source={{ uri: value.url!, height: value.height!, width: value.width! }}
            alt={value.alt || 'Avatar Image'}
            size="2xl"
            className="mx-auto rounded-full"
          />
          <HStack space="2xl" className="w-full justify-center">
            <Button onPress={pickImage}>
              <ButtonText>Change</ButtonText>
            </Button>
            <Button variant="link" action="negative" onPress={handleRemove}>
              <ButtonText>Remove</ButtonText>
            </Button>
          </HStack>
        </VStack>
      )}
    </Box>
  );
}
