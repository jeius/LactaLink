import { Image } from '@/components/Image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getImageAsset } from '@/lib/stores';
import { Asset } from 'expo-asset';
import React from 'react';

const steps: { title: string; description: string; image: Asset | null }[] = [
  {
    title: 'Review the Generated Code',
    description: 'Each milk bag has a unique 6-digit code. Check the code shown for each bag.',
    image: getImageAsset('bagVerification'),
  },
  {
    title: 'Label Each Milk Bag',
    description: 'Write the code on the bag with a permanent marker or attach a sticker.',
    image: getImageAsset('writeCode'),
  },
  {
    title: 'Take a Photo',
    description: 'Capture a clear photo of each bag with its code visible.',
    image: getImageAsset('captureBagPhoto'),
  },
];

export default function MilkBagVerificationTutorial() {
  return (
    <VStack space="2xl" className="flex-1 items-stretch p-5">
      <Text className="mb-4 text-center">
        Follow these steps to verify your milk bags and ensure safe tracking.
      </Text>

      {steps.map((step, index) => (
        <VStack key={index} space="md">
          <Image
            source={step.image}
            alt="Tutorial Image"
            className="rounded-2xl bg-background-300"
            style={{ width: '90%', aspectRatio: 1.75, alignSelf: 'center' }}
            contentFit="contain"
          />
          <Text size="lg" className="font-JakartaMedium">
            {index + 1}. {step.title}
          </Text>
          <Text className="mb-2 text-typography-800">{step.description}</Text>
        </VStack>
      ))}
    </VStack>
  );
}
