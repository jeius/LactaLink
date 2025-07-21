import { useAuth } from '@/hooks/auth/useAuth';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { createShadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Address, Where } from '@lactalink/types';
import { areStrings, checkIsOwner, extractCollection, extractID } from '@lactalink/utilities';
import { ListRenderItem } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { EditIcon, PlusIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, useWindowDimensions } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../animated/pressable';
import { useTheme } from '../AppProvider/ThemeProvider';
import { AddressCard } from '../cards';
import { FloatingActionButton } from '../FloatingActionButton';
import FetchingSpinner from '../loaders/FetchingSpinner';
import { NoData } from '../NoData';
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

type TValue<T extends boolean = false> = T extends true ? string[] : string;

interface AddressesBottomSheetProps<T extends boolean = false> {
  selected?: TValue<T> | null;
  onChange?: (selected: TValue<T>) => void;
  triggerComponent?: (props: { onPress: (e?: GestureResponderEvent) => void }) => React.ReactNode;
  allowMultipleSelection?: T;
  addresses?: (string | Address)[];
}

export function AddressesBottomSheet<T extends boolean = false>({
  selected: selectedProps,
  onChange,
  triggerComponent,
  allowMultipleSelection,
  addresses: addressesProp,
}: AddressesBottomSheetProps<T>) {
  const { user, ...auth } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();

  const { width: DEVICE_WIDTH } = useWindowDimensions();

  const defaultSelectedIDs = useRef<TValue<T> | undefined | null>(selectedProps);
  const [selected, setSelected] = useState<TValue<T> | undefined | null>(selectedProps);
  const [isDirty, setIsDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const [listSize, setListSize] = useState({ height: 360, width: DEVICE_WIDTH });

  const userAddresses = user?.addresses?.docs;
  const addresses = useMemo(
    () => addressesProp || userAddresses || [],
    [addressesProp, userAddresses]
  );

  const shouldFetch = areStrings(addresses);
  const where: Where = { id: { in: extractID(addresses) } };
  const { data: fetchedData, ...fetchQuery } = useFetchBySlug(shouldFetch, {
    collection: 'addresses',
    where,
    populate: {
      users: { email: true },
    },
    sort: 'createdAt',
  });

  const data = useMemo(
    () => (shouldFetch ? fetchedData : extractCollection(addresses) || []),
    [fetchedData, addresses, shouldFetch]
  );

  const isLoading = fetchQuery.isLoading || auth.isLoading;
  const isFetching = fetchQuery.isFetching || auth.isFetching;
  const isRefetching = fetchQuery.isRefetching || auth.isRefetching;
  const error = fetchQuery.error || auth.error;

  const isOwner = user && data ? checkIsOwner(user, data) : false;

  useEffect(() => {
    setSelected(selectedProps);
    defaultSelectedIDs.current = selectedProps;
    setIsDirty(false);
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

  function refetch() {
    if (shouldFetch) {
      fetchQuery.refetch();
    }
    auth.refetchUser();
  }

  const renderItem = useCallback<ListRenderItem<Address>>(
    ({ item, extraData: { selected, isLoading, allowMultipleSelection, isOwner } }) => {
      const selection: TValue<T> = selected;

      let isSelected = false;

      if (Array.isArray(selection)) {
        isSelected = selection.some((s) => s === item.id);
      } else {
        isSelected = selection === item.id;
      }

      function handlePress() {
        if (isSelected) {
          setSelected((prev) => {
            if (allowMultipleSelection && Array.isArray(prev)) {
              return prev.filter((s) => s !== item.id) as TValue<T>;
            } else {
              return undefined;
            }
          });
        } else {
          const newItem = item.id as TValue<T>;
          setSelected((prev) => {
            if (allowMultipleSelection && Array.isArray(prev)) {
              return [...prev, newItem] as TValue<T>;
            } else {
              return newItem;
            }
          });
        }
        setIsDirty(true);
      }

      return (
        <AnimatedPressable onPress={handlePress}>
          <AddressCardWrapper
            address={item}
            isSelected={isSelected}
            isLoading={isLoading}
            showEditButton={isOwner}
            onEditPress={handleClose}
          />
        </AnimatedPressable>
      );
    },
    []
  );

  const handleCreateNew = useCallback(() => {
    handleClose();
    router.push('/addresses/create');
  }, [router]);

  const EmptyComponent = useCallback(() => {
    return (
      !isLoading && (
        <VStack space="xl" className="mx-auto items-center p-4">
          <NoData title="Oops! Nothing to show here." />
          {isOwner && (
            <Button onPress={handleCreateNew}>
              <ButtonIcon as={PlusIcon} />
              <ButtonText>Create Address</ButtonText>
            </Button>
          )}
        </VStack>
      )
    );
  }, [isLoading, isOwner, handleCreateNew]);

  const HeaderComponent = useCallback(() => {
    if (data?.length === 0) return null;

    let text = 'Select a Address';
    if (isLoading) {
      text = 'Loading Addresses...';
    } else if (allowMultipleSelection) {
      text = 'Select one or more addresses';
    }

    return (
      <Box className="mx-auto mb-4">
        <Text size="lg" className="font-JakartaSemiBold">
          {text}
        </Text>
      </Box>
    );
  }, [allowMultipleSelection, isLoading, data?.length]);

  const FooterComponent = useCallback(() => {
    const isEmpty = data?.length === 0;
    if ((isEmpty && !isLoading) || !isOwner) return null;

    return (
      <Button size="sm" variant="link" action="default" onPress={handleCreateNew}>
        <ButtonIcon as={PlusIcon} />
        <ButtonText>Create New Address</ButtonText>
      </Button>
    );
  }, [handleCreateNew, isLoading, isOwner, data?.length]);

  function Trigger() {
    if (triggerComponent) {
      return triggerComponent({
        onPress: () => {
          setOpen(true);
        },
      });
    }
    return (
      <Button size="sm" variant="link" action="positive" onPress={() => setOpen(true)}>
        <ButtonIcon as={PlusIcon} className="text-success-500" />
        <ButtonText>Add Address</ButtonText>
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
        backdropComponent={BottomSheetBackdrop}
        enableContentPanningGesture={false}
        bottomInset={insets.bottom}
      >
        <Box
          className="relative flex-1"
          onLayout={(e) => {
            const { height, width } = e.nativeEvent.layout;
            setListSize({ height, width });
          }}
        >
          <BottomSheetFlashList
            data={data}
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
            estimatedListSize={listSize}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            ListHeaderComponent={HeaderComponent}
            ItemSeparatorComponent={() => <Box className="h-3" />}
            ListFooterComponent={FooterComponent}
            ListFooterComponentStyle={{
              marginVertical: 16,
              alignItems: 'flex-start',
            }}
          />

          <FloatingActionButton show={isDirty} onConfirm={handleSave} onCancel={handleCancel} />
        </Box>

        <FetchingSpinner isFetching={isFetching} />
      </BottomSheetModalPortal>
    </BottomSheet>
  );
}

interface AddressCardWrapperProps {
  address: Address;
  isSelected?: boolean;
  onEditPress?: () => void;
  isLoading?: boolean;
  showEditButton?: boolean;
}
function AddressCardWrapper({
  isLoading,
  isSelected,
  address,
  onEditPress,
  showEditButton,
}: AddressCardWrapperProps) {
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
    router.push(`/addresses/edit/${address.id}`);
  }

  return (
    <Card variant="filled" className={cardStyle({ isSelected })}>
      <HStack>
        <AddressCard data={address} variant="ghost" isLoading={isLoading} className="flex-1" />

        {showEditButton && (
          <VStack space="md" className="bg-primary-100 justify-center">
            <Button
              variant="link"
              action="default"
              className="h-fit w-fit p-5"
              onPress={handleEditPress}
            >
              <ButtonIcon as={EditIcon} />
            </Button>
          </VStack>
        )}
      </HStack>

      {isSelected && (
        <Box
          className="bg-success-500 absolute bottom-0 right-0 px-4 py-2"
          style={{ borderTopLeftRadius: 6 }}
        >
          <Text size="sm" className="text-success-0 font-JakartaSemiBold">
            Selected
          </Text>
        </Box>
      )}
    </Card>
  );
}
