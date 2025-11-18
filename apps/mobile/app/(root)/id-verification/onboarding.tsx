import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Image } from '@/components/Image';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getImageAsset } from '@/lib/stores';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

export default function VerificationOnboarding() {
  return (
    <SafeArea mode="margin" className="items-stretch p-5">
      <Box
        className="absolute z-10 rounded-full border border-outline-100 bg-background-0"
        style={{ top: 12, left: 12 }}
      >
        <HeaderBackButton style={{ marginRight: 0, padding: 12 }} />
      </Box>
      <ScrollView contentContainerClassName="flex-1 items-center gap-2">
        <Image
          source={getImageAsset('idVerification')}
          alt="Identity Verification Illustration"
          contentFit="contain"
          style={{ width: '100%', aspectRatio: 1 }}
        />
        <Text bold size="xl" className="px-5 text-center">
          Verify your identity
        </Text>
        <Text className="px-5 text-center">
          To ensure safety and trust, we need to verify your identity.
        </Text>
      </ScrollView>
      <Link asChild push href={'/id-verification/id-type'}>
        <Button>
          <ButtonText>Get Started</ButtonText>
        </Button>
      </Link>
    </SafeArea>
  );
}
