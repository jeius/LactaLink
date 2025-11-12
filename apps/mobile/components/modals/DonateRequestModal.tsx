import { AnimatedPressable } from '@/components/animated/pressable';
import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Modal, ModalBackdrop, ModalContent } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { getImageAsset } from '@/lib/stores';

import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { ComponentProps, createElement, FC, useState } from 'react';
import { GestureResponderEvent, useWindowDimensions } from 'react-native';
import { Icon } from '../ui/icon';
import { PressableProps } from '../ui/pressable';

interface ModalProps extends ComponentProps<typeof Modal> {
  trigger?: FC<PressableProps>;
}

export function DonateRequestModal({ onClose, trigger, ...props }: ModalProps) {
  const [open, setOpen] = useState(false);
  const [triggerPressed, setTriggerPressed] = useState(false);
  const router = useRouter();

  const { width } = useWindowDimensions();
  const donateImageSrc =
    width >= DEVICE_BREAKPOINTS.phone
      ? getImageAsset('pumpingMilk_0.75x')
      : getImageAsset('pumpingMilk');
  const requestImageSrc =
    width >= DEVICE_BREAKPOINTS.phone
      ? getImageAsset('deliveryGuy_0.75x')
      : getImageAsset('deliveryGuy');

  const handleModalTrigger = (event: GestureResponderEvent) => {
    setOpen((prev) => !prev);
    onClose?.(event);
  };

  const handleDonatePressed = () => {
    setOpen(false);
    setTimeout(() => {
      router.push('/donations/create');
    }, 100); // Delay to allow modal to close before navigating
  };

  const handleRequestPressed = () => {
    setOpen(false);
    setTimeout(() => {
      router.push('/requests/create');
    }, 100); // Delay to allow modal to close before navigating
  };

  return (
    <>
      {trigger ? (
        createElement(trigger, {
          onPress: handleModalTrigger,
        })
      ) : (
        <AnimatedPressable
          disableRipple
          onPress={() => {
            setOpen(true);
          }}
          onPressIn={() => setTriggerPressed(true)}
          onPressOut={() => setTriggerPressed(false)}
        >
          <Box
            className={`rounded-full p-4 ${triggerPressed ? 'bg-primary-600' : 'bg-primary-400'}`}
          >
            <Icon as={PlusIcon} size="xl" className="text-primary-0" />
          </Box>
        </AnimatedPressable>
      )}

      <Modal
        {...props}
        isOpen={props.isOpen || open}
        onClose={handleModalTrigger}
        className="bg-transparent"
      >
        <ModalBackdrop className="bg-background-0" />
        <ModalContent className="border-0 bg-transparent p-0 shadow-none">
          <VStack space="2xl" className="w-full items-center">
            {/* <Text size="2xl" className="font-JakartaSemiBold text-center">
              Do you want to donate or request milk?
            </Text> */}

            <AnimatedPressable onPress={handleDonatePressed} containerStyle={{ width: '100%' }}>
              <Card size="xl" className="relative h-44 border-primary-400 bg-primary-100 p-0">
                <Image
                  alt="Donate"
                  source={donateImageSrc}
                  contentFit="contain"
                  style={{ width: '100%', height: '100%' }}
                />
                <Box className="absolute inset-0 items-start justify-end p-2">
                  <Box className="rounded-xl bg-primary-400 p-3 opacity-90">
                    <Text size="xl" className="font-JakartaSemiBold text-primary-900">
                      Donate
                    </Text>
                  </Box>
                </Box>
              </Card>
            </AnimatedPressable>

            <AnimatedPressable onPress={handleRequestPressed} containerStyle={{ width: '100%' }}>
              <Card size="xl" className="relative h-44 border-tertiary-200 bg-tertiary-50 p-0">
                <Image
                  alt="Request"
                  source={requestImageSrc}
                  contentFit="contain"
                  style={{ width: '100%', height: '100%' }}
                />
                <Box className="absolute inset-0 items-start justify-end p-2">
                  <Box className="rounded-xl bg-tertiary-300 p-3 opacity-90">
                    <Text size="xl" className="font-JakartaSemiBold text-tertiary-900">
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
