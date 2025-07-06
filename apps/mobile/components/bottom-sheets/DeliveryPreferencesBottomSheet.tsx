import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { shadow } from '@/lib/utils/shadows';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { DeliveryPreference } from '@lactalink/types';
import { ListRenderItem } from '@shopify/flash-list';
import { ListXIcon, PlusIcon, SaveIcon } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../animated/pressable';
import DeliveryPreferenceCard from '../cards/DeliveryPreferenceCard';
import {
  BottomSheet,
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
  BottomSheetFlashList,
  BottomSheetModalPortal,
  BottomSheetTrigger,
} from '../ui/bottom-sheet';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface DeliveryPreferencesBottomSheetProps {
  selectedIDs?: string[];
  onChange?: (selectedIDs: string[]) => void;
  triggerComponent?: React.ReactNode;
}

export function DeliveryPreferencesBottomSheet({
  selectedIDs,
  onChange,
  triggerComponent,
}: DeliveryPreferencesBottomSheetProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const DEVICE_WIDTH = Dimensions.get('window').width;

  const [selected, setSelected] = useState(selectedIDs || []);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const {
    data: preferences,
    isLoading,
    isFetching,
    refetch,
    isRefetching,
  } = useFetchBySlug(true, {
    collection: 'delivery-preferences',
    where: { owner: { equals: user?.id } },
    populate: { addresses: { displayName: true, coordinates: true } },
    sort: 'createdAt',
  });

  function handleSave() {
    if (selected.length === 0) {
      return;
    }
    onChange?.(selected);
  }

  function handleClose() {
    bottomSheetModalRef.current?.close();
  }

  const renderItem = useCallback<ListRenderItem<DeliveryPreference>>(
    ({ item, extraData: { selected } }) => {
      const selectedItems = selected as string[];
      const isSelected = selectedItems.includes(item.id);

      function handlePress() {
        if (isSelected) {
          setSelected((prev) => prev.filter((id) => id !== item.id));
        } else {
          setSelected((prev) => [...prev, item.id]);
        }
      }

      return (
        <AnimatedPressable onPress={handlePress}>
          <DeliveryPreferenceCard preference={item} isSelected={isSelected} />
        </AnimatedPressable>
      );
    },
    []
  );

  const EmptyComponent = useCallback(() => {
    return (
      !isLoading && (
        <VStack space="lg" className="mx-auto items-center p-4">
          <Icon as={ListXIcon} className="text-primary-500 h-16 w-16" />
          <Text size="lg">Nothing to show.</Text>
        </VStack>
      )
    );
  }, [isLoading]);

  const FooterComponent = useCallback(() => {
    return (
      <Button size="sm" variant="link" action="default">
        <ButtonIcon as={PlusIcon} />
        <ButtonText>Create New</ButtonText>
      </Button>
    );
  }, []);

  return (
    <BottomSheet sheetModalRef={bottomSheetModalRef}>
      <BottomSheetTrigger>
        {triggerComponent || (
          <HStack space="xs" className="items-center">
            <Icon size="sm" as={PlusIcon} className="text-success-500" />
            <Text size="sm" className="font-JakartaSemiBold text-success-500">
              Add Delivery Preference
            </Text>
          </HStack>
        )}
      </BottomSheetTrigger>
      <BottomSheetModalPortal
        snapPoints={['60%']}
        enableDynamicSizing={false}
        handleComponent={(props) => <BottomSheetDragIndicator {...props} style={shadow.xs} />}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} className="bg-background-500" />
        )}
        enableBlurKeyboardOnGesture={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustPan"
        enableContentPanningGesture={false}
      >
        {isLoading ? (
          <Box className="h-full w-full items-center justify-center">
            <Spinner size="large" />
          </Box>
        ) : (
          <VStack space="lg" className="h-full w-full" style={{ paddingBottom: insets.bottom }}>
            <BottomSheetFlashList
              data={preferences || []}
              renderItem={renderItem}
              estimatedItemSize={200}
              automaticallyAdjustKeyboardInsets
              keyboardShouldPersistTaps="always"
              onEndReachedThreshold={0.2}
              keyExtractor={(item) => item.id}
              extraData={{ selected }}
              ListEmptyComponent={EmptyComponent}
              contentContainerStyle={{
                paddingBottom: insets.bottom,
                paddingHorizontal: 12,
                paddingTop: 12,
              }}
              estimatedListSize={{ height: 360, width: DEVICE_WIDTH }}
              refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
              ListHeaderComponent={isLoading ? <Spinner size="large" className="mt-4" /> : null}
              ListFooterComponent={FooterComponent}
              ListFooterComponentStyle={{
                marginVertical: 16,
                alignItems: 'flex-start',
              }}
            />

            <HStack space="md" className="px-4">
              <Button onPress={handleSave}>
                <ButtonIcon as={SaveIcon} />
                <ButtonText>Apply</ButtonText>
              </Button>

              <Button variant="outline" action="default" onPress={handleClose}>
                <ButtonText>Cancel</ButtonText>
              </Button>
            </HStack>
          </VStack>
        )}
      </BottomSheetModalPortal>
    </BottomSheet>
  );
}
