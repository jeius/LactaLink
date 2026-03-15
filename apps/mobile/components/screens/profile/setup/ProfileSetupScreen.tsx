import { Image } from '@/components/Image';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { signOut } from '@/auth';

import { getIconAsset } from '@/lib/stores/assetsStore';
import { useRouter } from 'expo-router';
import { LogOutIcon, Settings2Icon } from 'lucide-react-native';
import React from 'react';

export default function ProfileSetupScreen() {
  const router = useRouter();

  const nextPage = () => {
    router.push('/profile/setup/type');
  };

  return (
    <SafeArea className="items-center justify-center">
      <Card className="mx-5">
        <VStack space="2xl">
          <VStack className="items-center">
            <Image
              source={getIconAsset('accountVerified')}
              alt="Verified Account"
              style={{ width: 60, height: 60 }}
            />
            <Text size="2xl" bold className="mt-2">
              Account Verified
            </Text>
            <Text size="sm" className="text-typography-700">
              Welcome to LactaLink 👋
            </Text>
          </VStack>

          <Text size="md">
            We&apos;re excited to have you on board! Let&apos;s get your account ready.
          </Text>

          <Button size="lg" className="my-2 w-full" onPress={nextPage}>
            <ButtonIcon as={Settings2Icon} />
            <ButtonText>Setup Account</ButtonText>
          </Button>
        </VStack>
      </Card>
      <Button action="default" variant="link" onPress={signOut} className="mx-2 self-end">
        <ButtonIcon as={LogOutIcon} />
        <ButtonText>Log out</ButtonText>
      </Button>
    </SafeArea>
  );
}
