import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { shadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Address, DeliveryPreference, DeliveryPreferenceSchema } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { ListRenderItem } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { EditIcon, ListXIcon, PlusIcon, SaveIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, GestureResponderEvent } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../animated/pressable';
import { DeliveryPreferenceCard } from '../cards/DeliveryPreferenceCard';
import FetchingSpinner from '../loaders/FetchingSpinner';
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
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface DeliveryPreferencesBottomSheetProps {
  selected?: DeliveryPreferenceSchema[];
  onChange?: (selectedIDs: DeliveryPreferenceSchema[]) => void;
  triggerComponent?: React.ReactNode;
}

export function DeliveryPreferencesBottomSheet({
  selected: selectedProps,
  onChange,
  triggerComponent,
}: DeliveryPreferencesBottomSheetProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const DEVICE_WIDTH = Dimensions.get('window').width;

  const defaultSelectedIDs = useRef(selectedProps || []);
  const [selected, setSelected] = useState(selectedProps || []);
  const [isDirty, setIsDirty] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    data: preferences,
    isLoading,
    isFetching,
    refetch,
    isRefetching,
  } = useFetchBySlug(true, {
    collection: 'delivery-preferences',
    where: { owner: { equals: user?.id } },
    populate: { addresses: { displayName: true, coordinates: true, name: true } },
    sort: 'createdAt',
  });

  useEffect(() => {
    if (selectedProps) {
      setSelected(selectedProps);
      defaultSelectedIDs.current = selectedProps;
      setIsDirty(false);
    }
  }, [selectedProps]);

  function handleSave() {
    if (selected.length === 0) {
      return;
    }
    onChange?.(selected);
    setIsDirty(false);
    handleClose();
  }

  function handleCancel() {
    setSelected(defaultSelectedIDs.current);
    setIsDirty(false);
  }

  function handleClose() {
    setOpen(false);
  }

  const renderItem = useCallback<ListRenderItem<DeliveryPreference>>(
    ({ item, extraData: { selected, isLoading } }) => {
      const selectedItems = selected as DeliveryPreferenceSchema[];
      const isSelected = selectedItems.some((selected) => selected.id === item.id);

      function handlePress() {
        if (isSelected) {
          setSelected((prev) => prev.filter(({ id }) => id !== item.id));
        } else {
          const newItem: DeliveryPreferenceSchema = {
            ...item,
            address: extractID(item.address as Address),
          };
          setSelected((prev) => [...prev, newItem]);
        }
        setIsDirty(true);
      }

      return (
        <AnimatedPressable onPress={handlePress}>
          <PreferenceCard
            preference={item}
            isSelected={isSelected}
            isLoading={isLoading}
            onEditPress={() => {
              handleClose();
            }}
          />
        </AnimatedPressable>
      );
    },
    []
  );

  const handleCreateNew = useCallback(() => {
    handleClose();
    router.push('/delivery-preferences/create');
  }, [router]);

  const EmptyComponent = useCallback(() => {
    return (
      !isLoading && (
        <VStack space="lg" className="mx-auto items-center p-4">
          <Icon as={ListXIcon} className="text-primary-500 h-16 w-16" />
          <Text>Oops! Nothing to show here.</Text>
          <Button onPress={handleCreateNew}>
            <ButtonIcon as={PlusIcon} />
            <ButtonText>Add New Delivery Preference</ButtonText>
          </Button>
        </VStack>
      )
    );
  }, [isLoading, handleCreateNew]);

  const FooterComponent = useCallback(() => {
    const isEmpty = preferences?.length === 0;
    if (isEmpty) return null;

    return (
      <Button size="sm" variant="link" action="default" onPress={handleCreateNew}>
        <ButtonIcon as={PlusIcon} />
        <ButtonText>Add New Delivery Preference</ButtonText>
      </Button>
    );
  }, [handleCreateNew, preferences?.length]);

  return (
    <BottomSheet open={open} setOpen={setOpen}>
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
        handleComponent={(props) => (
          <BottomSheetDragIndicator {...props} className="py-4" style={shadow.xs} />
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
          <BottomSheetFlashList
            data={preferences || []}
            renderItem={renderItem}
            estimatedItemSize={200}
            automaticallyAdjustKeyboardInsets
            keyboardShouldPersistTaps="always"
            onEndReachedThreshold={0.2}
            keyExtractor={(item) => item.id}
            extraData={{ selected, isLoading }}
            ListEmptyComponent={EmptyComponent}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 24,
              paddingHorizontal: 12,
              paddingTop: 12,
            }}
            estimatedListSize={{ height: 360, width: DEVICE_WIDTH }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            ListHeaderComponent={
              <Box className="mx-auto mb-4">
                <Text size="lg" className="font-JakartaSemiBold">
                  Select from your Delivery Preferences
                </Text>
              </Box>
            }
            ItemSeparatorComponent={() => <Box className="h-3" />}
            ListFooterComponent={FooterComponent}
            ListFooterComponentStyle={{
              marginVertical: 16,
              alignItems: 'flex-start',
            }}
          />

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

        <FetchingSpinner isFetching={isFetching} />
      </BottomSheetModalPortal>
    </BottomSheet>
  );
}

interface PreferenceCardProps {
  preference: DeliveryPreference;
  isSelected?: boolean;
  onEditPress?: () => void;
  isLoading?: boolean;
}
function PreferenceCard({ isLoading, isSelected, preference, onEditPress }: PreferenceCardProps) {
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
    <Card className={cardStyle({ isSelected })}>
      <HStack>
        <DeliveryPreferenceCard
          preference={preference}
          variant="ghost"
          isLoading={isLoading}
          className="flex-1"
        />

        <VStack space="md" className="bg-primary-100 justify-center p-4">
          <Button className="h-fit w-fit p-4" onPress={handleEditPress}>
            <ButtonIcon as={EditIcon} />
          </Button>
        </VStack>
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
