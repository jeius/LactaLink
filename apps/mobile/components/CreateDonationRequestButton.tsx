import { AnimatedPressable } from '@/components/animated/pressable';
import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal, ModalBackdrop, ModalContent } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { getImageAsset } from '@/lib/stores';

import { useRouter } from 'expo-router';
import { LucideIcon, LucideProps, PlusIcon } from 'lucide-react-native';
import { ComponentProps, FC, useState } from 'react';
import { GestureResponderEvent } from 'react-native';

interface Props extends ComponentProps<typeof Button> {
  label?: string;
  icon?: LucideIcon | FC<LucideProps>;
  iconSize?: number | ComponentProps<typeof Button>['size'];
}

export function CreateDonationRequestButton({
  label,
  icon = PlusIcon,
  iconSize = 22,
  onPress,
  ...props
}: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const iconSizeValue = typeof iconSize === 'string' ? iconSize : undefined;
  const iconHeight = typeof iconSize === 'number' ? iconSize : undefined;
  const iconWidth = typeof iconSize === 'number' ? iconSize : undefined;

  const handleModalTrigger = (event: GestureResponderEvent) => {
    setOpen((prev) => !prev);
    onPress?.(event);
  };

  const handleDonatePressed = () => {
    setOpen(false);
    router.replace('/donations/create/details');
  };

  const handleRequestPressed = () => {
    setOpen(false);
    router.replace('/requests/create');
  };

  return (
    <>
      <Button {...props} onPress={handleModalTrigger}>
        <ButtonIcon as={icon} size={iconSizeValue} height={iconHeight} width={iconWidth} />
        {label && <ButtonText>{label}</ButtonText>}
      </Button>

      <Modal isOpen={open} onClose={handleModalTrigger} className="bg-transparent">
        <ModalBackdrop className="bg-background-0" />
        <ModalContent className="border-0 bg-transparent p-0 shadow-none">
          <VStack space="2xl" className="w-full items-center">
            <Text size="2xl" className="font-JakartaSemiBold text-center">
              Do you want to donate or request milk?
            </Text>

            <AnimatedPressable onPress={handleDonatePressed} style={{ width: '100%' }}>
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

            <AnimatedPressable onPress={handleRequestPressed} style={{ width: '100%' }}>
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
