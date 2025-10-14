import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Image } from '@/components/Image';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getImageAsset } from '@/lib/stores';
import { useRouter } from 'expo-router';
import React from 'react';

export default function IDVerificationOffboarding() {
  const router = useRouter();

  function handleBack() {
    router.back();
  }

  return (
    <SafeArea mode="margin" className="items-stretch justify-start gap-3 p-5">
      <Box
        className="bg-background-0 border-outline-100 absolute z-10 rounded-full border"
        style={{ top: 12, left: 12 }}
      >
        <HeaderBackButton style={{ marginRight: 0 }} />
      </Box>

      <Image source={getImageAsset('emailReceived')} style={{ width: '100%', aspectRatio: 1 }} />

      <Text className="font-JakartaMedium text-center">
        We have received your submission, this will be reviewed within 1-3 business days. We hope
        for your patience during this time.
      </Text>

      <Text size="xl" className="font-JakartaSemiBold mt-2 text-center">
        Thank you!
      </Text>

      <Box className="flex-1 justify-end">
        <Button className="mt-5" onPress={handleBack}>
          <ButtonText>Got it</ButtonText>
        </Button>
      </Box>
    </SafeArea>
  );
}
