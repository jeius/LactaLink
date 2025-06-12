import { AnimatedPressable } from '@/components/animated/pressable';
import LogoIcon from '@/components/icons/LogoIcon';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Modal, ModalBackdrop, ModalContent } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { ONBOARDING_IMAGES } from '@/lib/constants/images';

import { useRouter } from 'expo-router';
import React from 'react';

export function MainTabButton() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const handleModalTrigger = () => {
    setOpen((prev) => !prev);
  };

  const handleDonatePressed = () => {
    setOpen(false);
    router.push('/donations/create/details');
  };

  const handleRequestPressed = () => {
    setOpen(false);
    router.push('/requests/create');
  };

  return (
    <>
      <Button
        size="lg"
        animateOnPress
        onPress={handleModalTrigger}
        className="dark:bg-background-50 data-[active=true]:dark:bg-background-200 h-fit w-fit rounded-full p-3"
      >
        <ButtonIcon
          as={LogoIcon}
          width={40}
          height={40}
          className="fill-primary-0 dark:fill-primary-400"
          style={{ transform: [{ translateX: -1 }, { translateY: -1 }] }}
        />
      </Button>
      <Modal isOpen={open} onClose={handleModalTrigger} className="bg-transparent">
        <ModalBackdrop />
        <ModalContent className="border-0 bg-transparent p-0 shadow-none">
          <VStack space="4xl">
            <AnimatedPressable onPress={handleDonatePressed}>
              <Card size="xl" className="bg-primary-100 border-primary-400 relative h-44 p-0">
                <Image
                  alt="Donate"
                  source={ONBOARDING_IMAGES.onboarding2}
                  resizeMode="cover"
                  className="mx-auto h-full w-72"
                  width={250}
                />
                <Box className="absolute inset-0 items-center justify-center">
                  <Box className="bg-primary-400 rounded-xl p-3 opacity-90">
                    <Text size="xl" className="font-JakartaSemiBold text-primary-900">
                      Donate
                    </Text>
                  </Box>
                </Box>
              </Card>
            </AnimatedPressable>

            <AnimatedPressable onPress={handleRequestPressed}>
              <Card size="xl" className="bg-secondary-50 border-secondary-200 relative h-44 p-0">
                <Image
                  alt="Request"
                  source={ONBOARDING_IMAGES.onboarding3}
                  resizeMode="cover"
                  className="mx-auto h-full w-64"
                />
                <Box className="absolute inset-0 items-center justify-center">
                  <Box className="bg-secondary-300 rounded-xl p-3 opacity-90">
                    <Text size="xl" className="font-JakartaSemiBold text-secondary-900">
                      Request
                    </Text>
                  </Box>
                </Box>
              </Card>
            </AnimatedPressable>
          </VStack>
        </ModalContent>
      </Modal>
    </>
  );
}
