import { Box } from '@/components/ui/box';
import { Image } from '@/components/ui/image';
import { VStack } from '@/components/ui/vstack';
import React from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {
  const { width, height } = Dimensions.get('window');
  return (
    <SafeAreaView className="relative h-full flex-1 items-center justify-between">
      <VStack className="gap-0">
        <Box className="relative w-full p-5" style={{ height: height * 0.25 }}>
          <Image
            source={require('@/assets/svgs/sign-up.svg')}
            size={'full'}
            className="absolute inset-0"
          />
        </Box>
        <VStack className="w-full flex-1"></VStack>
      </VStack>
    </SafeAreaView>
  );
}
