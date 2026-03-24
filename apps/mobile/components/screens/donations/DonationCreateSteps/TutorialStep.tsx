import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import ScrollView from '@/components/ui/ScrollView';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getImageAsset } from '@/lib/stores/assetsStore';
import { Asset } from 'expo-asset';
import { Stack } from 'expo-router';
import React from 'react';
import { ImageSourcePropType } from 'react-native';

export default function TutorialStep({ onNextPress }: { onNextPress?: () => void }) {
  const steps: { title: string; description: string; image: Asset | null; alt: string }[] = [
    {
      title: 'Review the Generated Code',
      description: 'Each milk bag has a unique 6-digit code. Check the code shown for each bag.',
      image: getImageAsset('bagVerification'),
      alt: 'Example of a milk bag with a code label',
    },
    {
      title: 'Label Each Milk Bag',
      description: 'Write the code on the bag with a permanent marker or attach a sticker.',
      image: getImageAsset('writeCode'),
      alt: 'Person writing a code on a milk bag with a marker',
    },
    {
      title: 'Take a Photo',
      description: 'Capture a clear photo of each bag with its code visible.',
      image: getImageAsset('captureBagPhoto'),
      alt: 'Person taking a photo of a milk bag with their phone',
    },
  ];

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Milkbag Verification' }} />
      <SafeArea safeTop={false} className="items-stretch">
        <ScrollView className="flex-1" contentContainerClassName="grow gap-6 p-5">
          <Text className="mb-2 rounded-2xl bg-info-50 p-3 text-center text-info-700">
            Follow these steps to verify your milk bags and ensure safe tracking.
          </Text>

          <VStack space="3xl" className="flex-1">
            {steps.map((step, index) => (
              <VStack key={index} space="sm">
                {step.image && (
                  <Image
                    source={step.image as ImageSourcePropType}
                    alt={step.alt}
                    size="2xl"
                    contentFit="contain"
                    className="w-full self-center rounded-2xl bg-background-200"
                  />
                )}
                <Text size="lg" className="mt-1 font-JakartaSemiBold">
                  {index + 1}. {step.title}
                </Text>
                <Text>{step.description}</Text>
              </VStack>
            ))}
          </VStack>

          <Button className="mt-2" onPress={onNextPress}>
            <ButtonText>Proceed</ButtonText>
          </Button>
        </ScrollView>
      </SafeArea>
    </>
  );
}
