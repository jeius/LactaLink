import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { getImageAsset } from '@/lib/stores';
import { createShadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Address, DeliveryPreference, DeliveryPreferenceSchema, Where } from '@lactalink/types';
import { checkIsOwner, extractID } from '@lactalink/utilities';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { ListRenderItem } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { EditIcon, PlusIcon, SaveIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, GestureResponderEvent } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../animated/pressable';
import { useTheme } from '../AppProvider/ThemeProvider';
import { DeliveryPreferenceCard } from '../cards/DeliveryPreferenceCard';
import { Image } from '../Image';
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
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

type TValue<T extends boolean = false> = T extends true
  ? DeliveryPreferenceSchema[]
  : DeliveryPreferenceSchema;

interface DeliveryPreferencesBottomSheetProps<T extends boolean = false> {
  selected?: TValue<T> | null;
  onChange?: (selectedIDs: TValue<T>) => void;
  triggerComponent?: (props: { onPress: (e?: GestureResponderEvent) => void }) => React.ReactNode;
  allowMultipleSelection?: T;
  preferences?: (string | DeliveryPreference)[];
}

export function DeliveryPreferencesBottomSheet<T extends boolean = false>({
  selected: selectedProps,
  onChange,
  triggerComponent,
  allowMultipleSelection,
  preferences: preferencesProp,
}: DeliveryPreferencesBottomSheetProps<T>) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();

  const DEVICE_WIDTH = Dimensions.get('window').width;

  const defaultSelectedIDs = useRef<TValue<T> | undefined | null>(selectedProps);
  const [selected, setSelected] = useState<TValue<T> | undefined | null>(selectedProps);
  const [isDirty, setIsDirty] = useState(false);
  const [open, setOpen] = useState(false);

  const enableFetch = preferencesProp === undefined || typeof preferencesProp[0] === 'string';

  const where: Where =
    enableFetch && preferencesProp
      ? { id: { in: extractID(preferencesProp) } }
      : user && !preferencesProp
        ? { owner: { equals: user.id } }
        : {};

  const {
    data: preferenceDocs,
    isLoading,
    isFetching,
    refetch,
    isRefetching,
  } = useFetchBySlug(enableFetch, {
    collection: 'delivery-preferences',
    where,
    populate: { addresses: { displayName: true, coordinates: true, name: true } },
    sort: 'createdAt',
  });

  const preferences = preferenceDocs || (preferencesProp as DeliveryPreference[] | null) || [];

  const isOwner = user && preferences ? checkIsOwner(user, preferences) : false;

  useEffect(() => {
    if (selectedProps) {
      setSelected(selectedProps);
      defaultSelectedIDs.current = selectedProps;
      setIsDirty(false);
    }
  }, [selectedProps]);

  function handleSave() {
    if (!selected || (Array.isArray(selected) && selected.length === 0)) {
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
    ({ item, extraData: { selected, isLoading, allowMultipleSelection, isOwner } }) => {
      const selection = selected as DeliveryPreferenceSchema | DeliveryPreferenceSchema[];

      let isSelected = false;

      if (Array.isArray(selection)) {
        isSelected = selection.some((s) => s.id === item.id);
      } else {
        isSelected = selection?.id === item.id;
      }

      function handlePress() {
        if (isSelected) {
          setSelected((prev) => {
            if (allowMultipleSelection && Array.isArray(prev)) {
              return prev.filter((s) => s.id !== item.id) as TValue<T>;
            } else {
              return undefined;
            }
          });
        } else {
          const newItem: DeliveryPreferenceSchema = {
            ...item,
            address: extractID(item.address as Address),
          };
          setSelected((prev) => {
            if (allowMultipleSelection && Array.isArray(prev)) {
              return [...prev, newItem] as TValue<T>;
            } else {
              return newItem as TValue<T>;
            }
          });
        }
        setIsDirty(true);
      }

      return (
        <AnimatedPressable onPress={handlePress}>
          <PreferenceCard
            preference={item}
            isSelected={isSelected}
            isLoading={isLoading}
            showEditButton={isOwner}
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
        <VStack className="mx-auto items-center p-4">
          <Image
            alt="Nothing found"
            source={getImageAsset('noData_0.75x')}
            contentFit="contain"
            style={{ width: '60%', aspectRatio: 1.25 }}
          />
          <Text className="mb-5">Oops! Nothing to show here.</Text>
          {isOwner && (
            <Button onPress={handleCreateNew}>
              <ButtonIcon as={PlusIcon} />
              <ButtonText>Add New Delivery Preference</ButtonText>
            </Button>
          )}
        </VStack>
      )
    );
  }, [isLoading, isOwner, handleCreateNew]);

  const HeaderComponent = useCallback(() => {
    const isEmpty = preferences?.length === 0;
    if (isEmpty) return null;

    let text = 'Select a Delivery Preference';
    if (isLoading) {
      text = 'Loading Delivery Preferences...';
    } else if (allowMultipleSelection) {
      text = 'Select one or more preferences';
    }

    return (
      <Box className="mx-auto mb-4">
        <Text size="lg" className="font-JakartaSemiBold">
          {text}
        </Text>
      </Box>
    );
  }, [allowMultipleSelection, isLoading, preferences?.length]);

  const FooterComponent = useCallback(() => {
    const isEmpty = preferences?.length === 0;
    if ((isEmpty && !isLoading) || !isOwner) return null;

    return (
      <Button size="sm" variant="link" action="default" onPress={handleCreateNew}>
        <ButtonIcon as={PlusIcon} />
        <ButtonText>Add New Delivery Preference</ButtonText>
      </Button>
    );
  }, [handleCreateNew, isLoading, isOwner, preferences?.length]);

  function Trigger() {
    if (triggerComponent) {
      return triggerComponent({
        onPress: () => {
          setOpen(true);
          console.log('Delivery Preferences Bottom Sheet Triggered');
        },
      });
    }
    return (
      <Button size="sm" variant="link" action="positive" onPress={() => setOpen(true)}>
        <ButtonIcon as={PlusIcon} className="text-success-500" />
        <ButtonText>Add Delivery Preference</ButtonText>
      </Button>
    );
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
          <BottomSheetFlashList
            data={preferences || []}
            renderItem={renderItem}
            estimatedItemSize={200}
            automaticallyAdjustKeyboardInsets
            keyboardShouldPersistTaps="always"
            onEndReachedThreshold={0.2}
            keyExtractor={(item) => item.id}
            extraData={{ selected, isLoading, allowMultipleSelection, isOwner }}
            ListEmptyComponent={EmptyComponent}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 24,
              paddingHorizontal: 12,
              paddingTop: 12,
            }}
            estimatedListSize={{ height: 360, width: DEVICE_WIDTH }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            ListHeaderComponent={HeaderComponent}
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
