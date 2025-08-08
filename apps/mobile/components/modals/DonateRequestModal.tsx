import { AnimatedPressable } from '@/components/animated/pressable';
import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Modal, ModalBackdrop, ModalContent } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { getImageAsset } from '@/lib/stores';

import { useRouter } from 'expo-router';
import { PlusIcon } from 'lucide-react-native';
import { ComponentProps, ReactNode, useState } from 'react';
import { GestureResponderEvent } from 'react-native';
import { Icon } from '../ui/icon';

interface ModalProps extends ComponentProps<typeof Modal> {
  trigger?: ReactNode;
}

export function DonateRequestModal({ onClose, trigger, ...props }: ModalProps) {
  const [open, setOpen] = useState(false);
  const [triggerPressed, setTriggerPressed] = useState(false);
  const router = useRouter();

  const handleModalTrigger = (event: GestureResponderEvent) => {
    setOpen((prev) => !prev);
    onClose?.(event);
  };

  const handleDonatePressed = () => {
    setOpen(false);
    setTimeout(() => {
      router.push('/donations/create', {
        withAnchor: true,
      });
    }, 100); // Delay to allow modal to close before navigating
  };

  const handleRequestPressed = () => {
    setOpen(false);
    setTimeout(() => {
      router.push('/requests/create', {
        withAnchor: true,
      });
    }, 100); // Delay to allow modal to close before navigating
  };

  return (
    <>
      <AnimatedPressable
        onPress={() => {
          setOpen(true);
        }}
        onPressIn={() => setTriggerPressed(true)}
        onPressOut={() => setTriggerPressed(false)}
      >
        {trigger || (
          <Box
            className={`rounded-full p-4 ${triggerPressed ? 'bg-primary-600' : 'bg-primary-400'}`}
          >
            <Icon as={PlusIcon} size="xl" className="text-primary-0" />
          </Box>
        )}
      </AnimatedPressable>

      <Modal
        {...props}
        isOpen={props.isOpen || open}
        onClose={handleModalTrigger}
        className="bg-transparent"
      >
        <ModalBackdrop className="bg-background-0" />
        <ModalContent className="border-0 bg-transparent p-0 shadow-none">
          <VStack space="2xl" className="w-full items-center">
            <Text size="2xl" className="font-JakartaSemiBold text-center">
              Do you want to donate or request milk?
            </Text>

            <AnimatedPressable onPress={handleDonatePressed} containerStyle={{ width: '100%' }}>
              <Card size="xl" className="bg-primary-100 border-primary-400 relative h-44 p-0">
                <Image
                  alt="Donate"
                  source={getImageAsset('onboarding2')}
                  contentFit="contain"
                  style={{ width: '100%', height: '100%' }}
                />
                <Box className="absolute inset-0 items-start justify-end p-2">
                  <Box className="bg-primary-400 rounded-xl p-3 opacity-90">
                    <Text size="xl" className="font-JakartaSemiBold text-primary-900">
                      Donate
                    </Text>
                  </Box>
                </Box>
              </Card>
            </AnimatedPressable>

            <AnimatedPressable onPress={handleRequestPressed} containerStyle={{ width: '100%' }}>
              <Card size="xl" className="bg-secondary-50 border-secondary-200 relative h-44 p-0">
                <Image
                  alt="Request"
                  source={getImageAsset('onboarding3')}
                  contentFit="contain"
                  style={{ width: '100%', height: '100%' }}
                />
                <Box className="absolute inset-0 items-start justify-end p-2">
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
