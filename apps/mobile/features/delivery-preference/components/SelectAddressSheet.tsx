import { AnimatedPressable } from '@/components/animated/pressable';
import { FloatingActionButton } from '@/components/buttons';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { InfiniteFlashList, InfiniteFlashListProps, ListRenderItem } from '@/components/ui/list';
import { PressableProps } from '@/components/ui/pressable';
import Sheet from '@/components/ui/sheet';
import { SheetRef } from '@/components/ui/sheet/Sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import AddressCard from '@/features/address/components/AddressCard';
import { shadow } from '@/lib/utils/shadows';
import { Address } from '@lactalink/types/payload-generated-types';
import { extractID, listKeyExtractor } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import isEqual from 'lodash/isEqual';
import { PlusIcon } from 'lucide-react-native';
import React, { createElement, FC, useCallback, useEffect, useRef, useState } from 'react';
import { GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SelectAddressSheetProps<T extends (string | Address)[] | string | Address | null> {
  isMultiSelect?: boolean;
  addresses: Address[];
  selected?: T;
  onSelect?: (item: T) => void;
  trigger: FC<PressableProps>;
  queryOptions?: Pick<
    InfiniteFlashListProps<Address>,
    'hasNextPage' | 'fetchNextPage' | 'isFetchingNextPage' | 'isPlaceholderData'
  >;
}

export default function SelectAddressSheet<T extends Address[] | Address | null>({
  isMultiSelect,
  selected,
  onSelect,
  addresses,
  queryOptions,
  trigger,
}: SelectAddressSheetProps<T>) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<SheetRef>(null);

  const [fabHeight, setFabHeight] = useState(0);

  const [localSelected, setLocalSelected] = useState(selected);
  const [isDirty, setIsDirty] = useState(false);

  const renderItem = useCallback<ListRenderItem<Address>>(
    ({ item, isPlaceholder }) => {
      if (isPlaceholder) return <Skeleton className="h-32" />;

      const isSelected = !localSelected
        ? false
        : Array.isArray(localSelected)
          ? localSelected.some((s) => extractID(s) === item.id)
          : extractID(localSelected) === item.id;

      const handleSelect = (value: Address) => {
        let newState: T;
        if (Array.isArray(localSelected)) {
          if (isSelected) {
            newState = localSelected.filter((s) => extractID(s) !== value.id) as T;
          } else {
            newState = (isMultiSelect ? [...localSelected, value] : [value]) as T;
          }
        } else {
          if (isSelected) newState = null as T;
          else newState = value as T;
        }
        setIsDirty(!isEqual(extractID(localSelected), extractID(newState)));
        setLocalSelected(newState);
      };

      return <ListItem item={item} isSelected={isSelected} onPress={handleSelect} />;
    },
    [isMultiSelect, localSelected]
  );

  const handleOpen = useCallback((e: GestureResponderEvent) => {
    if (e.defaultPrevented) return;
    sheetRef.current?.present();
  }, []);

  const handleConfirm = useCallback(() => {
    if (localSelected === undefined) return;
    onSelect?.(localSelected);
    sheetRef.current?.dismiss();
  }, [localSelected, onSelect]);

  const reset = useCallback(() => {
    setLocalSelected(selected);
    setIsDirty(false);
  }, [selected]);

  useEffect(() => {
    reset();
  }, [reset, selected]);

  return (
    <>
      {createElement(trigger, { onPress: handleOpen })}

      <Sheet
        ref={sheetRef}
        detents={[0.5, 1]}
        scrollable
        footer={
          <FloatingActionButton
            show={isDirty}
            confirmLabel="Select"
            confirmIcon={null}
            cancelLabel="Cancel"
            onConfirm={handleConfirm}
            onCancel={reset}
            style={{ bottom: insets.bottom + 4, position: 'relative' }}
            onLayout={(e) => setFabHeight(e.nativeEvent.layout.height)}
          />
        }
      >
        <InfiniteFlashList
          {...queryOptions}
          gap={12}
          nestedScrollEnabled
          data={addresses}
          keyExtractor={listKeyExtractor}
          renderItem={renderItem}
          contentContainerClassName="p-4 pt-0"
          ListHeaderComponent={addresses.length ? <ListHeader /> : null}
          ListEmptyComponent={<ListEmpty />}
          ListFooterComponent={<ListFooter />}
          ListHeaderComponentStyle={{ marginBottom: 12 }}
          ListFooterComponentStyle={{
            marginTop: 12,
            marginBottom: isDirty ? fabHeight + 4 : undefined,
          }}
        />
      </Sheet>
    </>
  );
}

function ListItem({
  item,
  isSelected,
  onPress,
}: {
  item: Address;
  isSelected?: boolean;
  onPress?: (item: Address) => void;
}) {
  return (
    <AnimatedPressable
      className="overflow-hidden rounded-2xl"
      style={shadow.sm}
      onPress={() => onPress?.(item)}
    >
      <AddressCard
        data={item}
        disableLinks
        disableTapOnMap
        className={isSelected ? 'border-2 border-primary-500' : undefined}
      />
    </AnimatedPressable>
  );
}

function ListEmpty() {
  return (
    <VStack space="sm" className="items-center">
      <Text className="text-typography-700">You have no addresses yet</Text>
      <Link asChild href="/addresses/create">
        <Button>
          <ButtonIcon as={PlusIcon} />
          <ButtonText>Add Address</ButtonText>
        </Button>
      </Link>
    </VStack>
  );
}

function ListHeader() {
  return (
    <Text bold size="lg" className="text-center">
      Select from your addresses
    </Text>
  );
}

function ListFooter() {
  return (
    <Button disablePressAnimation size="sm" action="default" variant="ghost">
      <ButtonIcon as={PlusIcon} />
      <ButtonText>Add New Address</ButtonText>
    </Button>
  );
}
