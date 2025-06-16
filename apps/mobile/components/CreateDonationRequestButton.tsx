import { AnimatedPressable } from '@/components/animated/pressable';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { Modal, ModalBackdrop, ModalContent } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { ONBOARDING_IMAGES } from '@/lib/constants/images';

import { useRouter } from 'expo-router';
import { LucideIcon, LucideProps, PlusIcon } from 'lucide-react-native';
import { ComponentProps, FC, useState } from 'react';

interface Props extends ComponentProps<typeof Button> {
  label?: string;
  icon?: LucideIcon | FC<LucideProps>;
  iconSize?: number | ComponentProps<typeof Button>['size'];
}

export function CreateDonationRequestButton({
  label,
  icon = PlusIcon,
  iconSize = 22,
  ...props
}: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const iconSizeValue = typeof iconSize === 'string' ? iconSize : undefined;
  const iconHeight = typeof iconSize === 'number' ? iconSize : undefined;
  const iconWidth = typeof iconSize === 'number' ? iconSize : undefined;

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
      <Button {...props} onPress={handleModalTrigger}>
        <ButtonIcon as={icon} size={iconSizeValue} height={iconHeight} width={iconWidth} />
        {label && <ButtonText>{label}</ButtonText>}
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
