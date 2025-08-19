import React from 'react';
import { Image } from '../Image';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

export default function MilkBagVerificationTutorial() {
  return (
    <VStack space="xl" className="flex-1 items-stretch p-5">
      <Text className="text-center">
        Follow these steps to verify your milk bags and ensure safe tracking.
      </Text>

      {/* Step 1 */}
      <VStack space="md">
        <Image
          source={null}
          className="bg-background-300 rounded-2xl"
          style={{ width: '90%', aspectRatio: 1.75 }}
          contentFit="contain"
        />
        <Text size="lg" className="font-JakartaMedium">
          1. Review the Generated Code
        </Text>
        <Text className="text-typography-800">
          Each milk bag has a unique 6-digit code. Check the code shown for each bag.
        </Text>
      </VStack>

      {/* Step 2 */}
      <VStack space="md">
        <Image
          source={null}
          className="bg-background-300 rounded-2xl"
          style={{ width: '90%', aspectRatio: 1.75 }}
          contentFit="contain"
        />
        <Text size="lg" className="font-JakartaMedium">
          2. Label Each Milk Bag
        </Text>
        <Text className="text-typography-800">
          Write the code on the bag with a permanent marker or attach a sticker.
        </Text>
      </VStack>

      {/* Step 3 */}
      <VStack space="md">
        <Image
          source={null}
          className="bg-background-300 rounded-2xl"
          style={{ width: '90%', aspectRatio: 1.75 }}
          contentFit="contain"
        />
        <Text size="lg" className="font-JakartaMedium">
          3. Take a Photo
        </Text>
        <Text className="text-typography-800">
          Capture a clear photo of each bag with its code visible.
        </Text>
      </VStack>
    </VStack>
  );
}
