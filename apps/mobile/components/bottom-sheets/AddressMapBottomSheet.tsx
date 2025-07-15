import { useAuth } from '@/hooks/auth/useAuth';
import { createShadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { AddressSchema, DeliveryPreference, DeliveryPreferenceSchema } from '@lactalink/types';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { useRouter } from 'expo-router';
import { EditIcon, SaveIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../AppProvider/ThemeProvider';
import { DeliveryPreferenceCard } from '../cards/DeliveryPreferenceCard';
import {
  BottomSheet,
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
  BottomSheetModalPortal,
  BottomSheetScrollView,
  BottomSheetTrigger,
} from '../ui/bottom-sheet';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

type TValue<T extends boolean = false> = T extends true
  ? DeliveryPreferenceSchema[]
  : DeliveryPreferenceSchema;

interface AddressMapBottomSheetProps {
  address?: AddressSchema;
  onChange?: () => void;
  isLoading?: boolean;
}

export function AddressMapBottomSheet({ onChange, address }: AddressMapBottomSheetProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();

  const DEVICE_WIDTH = Dimensions.get('window').width;

  const [isDirty, setIsDirty] = useState(false);
  const [open, setOpen] = useState(false);

  function handleSave() {
    onChange?.();
    setIsDirty(false);
  }

  function handleCancel() {
    setIsDirty(false);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <BottomSheet open={open} setOpen={setOpen}>
      <BottomSheetTrigger disableAnimation>
        <Trigger />
      </BottomSheetTrigger>
      <BottomSheetModalPortal
        snapPoints={['60%']}
        enableDynamicSizing={false}
        handleComponent={(props) => (
          <BottomSheetDragIndicator {...props} className="py-4" style={createShadow(theme).xs} />
        )}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} className="bg-background-500" />
        )}
        enableBlurKeyboardOnGesture={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustPan"
        enableContentPanningGesture={false}
      >
        <VStack className="relative h-full w-full" style={{ paddingBottom: insets.bottom }}>
          <BottomSheetScrollView>
            <VStack></VStack>
          </BottomSheetScrollView>

          <AnimatePresence>
            {isDirty && (
              <Motion.View
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                style={{
                  marginBottom: insets.bottom,
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 8,
                }}
              >
                <Card className="mx-auto p-4">
                  <HStack space="md" className="justify-end">
                    <Button onPress={handleSave}>
                      <ButtonIcon as={SaveIcon} />
                      <ButtonText>Apply</ButtonText>
                    </Button>

                    <Button variant="outline" action="default" onPress={handleCancel}>
                      <ButtonText>Cancel</ButtonText>
                    </Button>
                  </HStack>
                </Card>
              </Motion.View>
            )}
          </AnimatePresence>
        </VStack>
      </BottomSheetModalPortal>
    </BottomSheet>
  );
}

interface PreferenceCardProps {
  preference: DeliveryPreference;
  isSelected?: boolean;
  onEditPress?: () => void;
  isLoading?: boolean;
  showEditButton?: boolean;
}
function PreferenceCard({
  isLoading,
  isSelected,
  preference,
  onEditPress,
  showEditButton,
}: PreferenceCardProps) {
  const router = useRouter();

  const cardStyle = tva({
    base: 'relative w-full p-0',
    variants: {
      isSelected: {
        true: 'border-success-500',
      },
    },
  });

  function handleEditPress(event: GestureResponderEvent) {
    onEditPress?.();
    event.stopPropagation();
    router.push(`/delivery-preferences/edit/${preference.id}`);
  }

  return (
    <Card variant="filled" className={cardStyle({ isSelected })}>
      <HStack>
        <DeliveryPreferenceCard
          preference={preference}
          variant="ghost"
          isLoading={isLoading}
          className="flex-1"
        />

        {showEditButton && (
          <VStack space="md" className="bg-primary-100 justify-center p-4">
            <Button className="h-fit w-fit p-4" onPress={handleEditPress}>
              <ButtonIcon as={EditIcon} />
            </Button>
          </VStack>
        )}
      </HStack>

      {isSelected && (
        <Box
          className="bg-success-500 absolute right-0 top-0 px-4 py-2"
          style={{ borderBottomLeftRadius: 6 }}
        >
          <Text size="xs" className="text-success-0 font-JakartaMedium">
            Selected
          </Text>
        </Box>
      )}
    </Card>
  );
}
