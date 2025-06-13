import Verified from '@/assets/svgs/account-verified.svg';
import { VStack } from '@/components/ui/vstack';

import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { usePagination } from '@/hooks/forms/usePagination';
import { SETUP_PROFILE_STEPS } from '@/lib/constants/setupProfile';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';
import { Settings2Icon } from 'lucide-react-native';
import React from 'react';

const STEPS = createDynamicRoute('/setup-profile', SETUP_PROFILE_STEPS);

export default function Setup() {
  const { nextPage } = usePagination(STEPS);

  return (
    <SafeArea className="justify-center">
      <Card className="m-5">
        <VStack space="2xl">
          <VStack className="items-center">
            <Verified height={64} width={64} />
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
    </SafeArea>
  );
}
