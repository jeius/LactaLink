import { Collection, CollectionSlug, Where } from '@lactalink/types';
import { useDebounce } from '@lactalink/utilities';
import { useQuery } from '@tanstack/react-query';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

import {
  InfiniteFetchOptions,
  useInfiniteFetchBySlug,
} from '@/hooks/collections/useInfiniteFetchBySlug';
import { useApiClient } from '@lactalink/api';
import {
  ChevronDownIcon,
  LucideIcon,
  LucideProps,
  LucideSearchX,
  SearchIcon,
  XIcon,
} from 'lucide-react-native';
import { TextInput } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from './ui/box';
import { Button, ButtonIcon } from './ui/button';
import { Icon } from './ui/icon';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { Pressable } from './ui/pressable';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { BottomSheetModal as BottomSheetModalType } from '@gorhom/bottom-sheet';
import { ListRenderItem } from '@shopify/flash-list';
import { Dimensions } from 'react-native';
import { RefreshControl } from './RefreshControl';
import {
  BottomSheet,
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
  BottomSheetFlashList,
  BottomSheetModalPortal,
  BottomSheetTextInput,
  BottomSheetTrigger,
} from './ui/bottom-sheet';
import { HStack } from './ui/hstack';

export type ComboboxType<T extends CollectionSlug = CollectionSlug> = {
  /**
   * The collection from which the items will be fetched.
   * This should be a valid collection slug like 'users', 'products', etc.
   */
  collection: T;
  /**
   * Optional limit for the number of items to fetch per request.
   * This can be used to control the number of items displayed in the dropdown.
   * Default is 20.
   */
  limit?: number;
  /**
   * Optional where clause to filter the results.
   * This can be used to limit the results based on certain conditions.
   * For example, you can filter by owner, status, etc.
   */
  where?: Where;
  /**
   * Path to the field in the collection that will be used for searching.
   * This should be a field that contains text data, like a name or title.
   */
  searchPath: keyof Collection<T>;
  /**
   * Path to the label field in the collection.
   * This will be used to display the label in the dropdown.
   * If not provided, it will default to the searchPath.
   */
  labelPath?: keyof Collection<T>;
  /**
   * Path to the description field in the collection.
   * If provided, it will be used to show additional information in the dropdown.
   * @todo Not implemented yet
   */
  descriptionPath?: keyof Collection<T>;
  /**
   * Placeholder text for the search input.
   * This will be displayed when the input is empty.
   */
  searchPlaceholder?: string;

  /**
   * Icon to be displayed in the combobox.
   * This can be a Lucide icon or a custom React component.
   */
  icon?: LucideIcon | FC<LucideProps>;

  /**
   * Position of the icon in the combobox.
   * This can be 'left' or 'right'.
   *
   * Default is 'right'.
   */
  iconPosition?: 'left' | 'right';
};

export type InfiniteScrollComboBoxProps<T extends CollectionSlug = CollectionSlug> =
  ComboboxType<T> & {
    value?: string;
    onChange?: (val: string) => void;
    placeholder?: string;
    isDisabled?: boolean;
  };

const DEVICE_WIDTH = Dimensions.get('window').width;

export default function ComboBox<T extends CollectionSlug = CollectionSlug>({
  collection,
  limit = 20,
  where: whereParam,
  placeholder,
  value: selectedProps,
  onChange: setSelectedProps,
  searchPath,
  labelPath = searchPath,
  descriptionPath,
  searchPlaceholder = 'Search here...',
  isDisabled: disabled,
  icon,
  iconPosition,
}: InfiniteScrollComboBoxProps<T>) {
  const apiClient = useApiClient();
  const inputRef = useRef<TextInput>(null);
  const bottomSheetModalRef = useRef<BottomSheetModalType>(null);

  const insets = useSafeAreaInsets();

  const [searchDefault, setSearchDefault] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(selectedProps);

  const { data: selectedLabel, isFetching: isFetchingLabel } = useQuery<string | null>({
    enabled: Boolean(selected),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60,
    refetchOnMount: true,
    queryKey: ['combobox', 'label', selected],
    queryFn: async () => {
      if (selected) {
        const res = await apiClient.findByID({
          id: selected,
          collection,
          depth: 0,
          //@ts-expect-error typescript cant infer here.
          select: { [labelPath]: true },
        });

        return (res[labelPath] as string) || null;
      }
      return null;
    },
  });

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const searchQuery: Where = { [searchPath]: { contains: debouncedSearch.toLowerCase() } };
  const where: Where = whereParam ? { and: [searchQuery, whereParam] } : searchQuery;
  const options: InfiniteFetchOptions<T> = {
    depth: 0,
    where,
    sort: searchPath,
    limit,
    //@ts-expect-error typescript cant infer here.
    select: descriptionPath
      ? { [searchPath]: true, [labelPath]: true, [descriptionPath]: true }
      : { [searchPath]: true, [labelPath]: true },
  };

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, isRefetching, refetch } =
    useInfiniteFetchBySlug(collection, true, options);

  const items = useMemo(() => data?.pages?.flatMap((page) => page.docs) || [], [data]);

  useEffect(() => {
    if (!open) {
      setSearchDefault((prev) => (prev !== search ? search : prev));
    }
  }, [open, search]);

  function resetSelection() {
    clearSearch();
    handleSelectionChange('');
  }

  function clearSearch() {
    setSearch('');
    setSearchDefault('');
    inputRef.current?.clear();
  }

  function handleSelectionChange(value: string) {
    handleClose();
    setTimeout(() => {
      setSelected(value);
      setSelectedProps?.(value);
    }, 50); // Delay to ensure the bottom sheet closes before setting the value
  }

  function handleOpen() {
    bottomSheetModalRef.current?.present();
    setOpen(true);
  }

  function handleClose() {
    bottomSheetModalRef.current?.dismiss();
    setOpen(false);
  }

  const renderItem: ListRenderItem<Collection<T>> = ({ item, extraData: { selected } }) => {
    const isSelected = selected === item.id;
    return (
      <ComboBoxItem
        label={String(item[labelPath])}
        description={descriptionPath && String(item[descriptionPath])}
        isSelected={isSelected}
        onPress={() => handleSelectionChange(item.id)}
        icon={icon}
        iconPosition={iconPosition}
      />
    );
  };

  function EmptyComponent() {
    return (
      !isLoading && (
        <VStack space="lg" className="mx-auto items-center p-4">
          <Icon as={LucideSearchX} className="text-primary-500 h-16 w-16" />
          <Text size="lg">No results found.</Text>
        </VStack>
      )
    );
  }

  return (
    <BottomSheet open={open} setOpen={setOpen} sheetModalRef={bottomSheetModalRef}>
      <BottomSheetTrigger className="w-full" disabled={disabled}>
        <Input pointerEvents="box-none" size="md" isDisabled={disabled}>
          <InputField
            value={isFetchingLabel ? 'Loading...' : selectedLabel || ''}
            placeholder={placeholder || 'Select option...'}
            editable={false}
            pointerEvents="none"
          />
          <InputSlot>
            {selected && !isFetchingLabel && (
              <Button
                isDisabled={disabled || isFetchingLabel}
                variant="link"
                className="px-2"
                action="negative"
                onPress={resetSelection}
              >
                <ButtonIcon as={XIcon} />
              </Button>
            )}
            {isFetchingLabel && <Spinner size="small" className="mx-2" />}
          </InputSlot>
          <InputSlot onPress={handleOpen}>
            <InputIcon as={ChevronDownIcon} className="mr-3" />
          </InputSlot>
        </Input>
      </BottomSheetTrigger>
      <BottomSheetModalPortal
        snapPoints={['45%']}
        enableDynamicSizing={false}
        handleComponent={BottomSheetDragIndicator}
        backdropComponent={BottomSheetBackdrop}
        enableBlurKeyboardOnGesture={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustPan"
        enableContentPanningGesture={false}
        bottomInset={insets.bottom}
      >
        <Box className="bg-background-0 w-full p-5 pt-0 shadow">
          <Input>
            <InputIcon as={SearchIcon} className="text-primary-400 ml-3" />
            <BottomSheetTextInput
              ref={inputRef}
              defaultValue={searchDefault}
              onChangeText={setSearch}
              placeholder={searchPlaceholder}
            />
            {search && (
              <InputSlot onPress={clearSearch} className="pr-3">
                <Icon as={XIcon} size="sm" className="text-secondary-400" />
              </InputSlot>
            )}
          </Input>
        </Box>

        <Box className="h-full w-full">
          <BottomSheetFlashList
            data={items}
            renderItem={renderItem}
            estimatedItemSize={50}
            automaticallyAdjustKeyboardInsets
            keyboardShouldPersistTaps="always"
            onEndReachedThreshold={0.2}
            keyExtractor={(item) => item.id}
            extraData={{ selected: selected }}
            ListEmptyComponent={EmptyComponent}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListFooterComponentStyle={{ marginBottom: 12 }}
            estimatedListSize={{ height: 256, width: DEVICE_WIDTH }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            ListHeaderComponent={isLoading ? <Spinner size="large" className="mt-4" /> : null}
            ListFooterComponent={isFetchingNextPage ? <Spinner size="small" /> : null}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
          />
        </Box>
      </BottomSheetModalPortal>
    </BottomSheet>
  );
}

type ComboBoxItemProps = Pick<ComboboxType, 'icon' | 'iconPosition'> & {
  label: string;
  description?: string;
  isSelected?: boolean;
  onPress?: () => void;
};

function ComboBoxItem({
  label,
  description,
  onPress,
  isSelected = false,
  icon,
  iconPosition = 'right',
}: ComboBoxItemProps) {
  const [isPressed, setIsPressed] = useState(false);
  const style = tva({
    base: 'items-center px-4 py-3',
    variants: {
      isSelected: { true: 'bg-primary-200' },
      isPressed: { true: 'bg-background-100' },
    },
  });
  const onPressIn = () => setIsPressed(true);
  const onPressOut = () => setIsPressed(false);
  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <HStack space="md" className={style({ isSelected, isPressed })}>
        {icon && iconPosition === 'left' && (
          <Icon as={icon} className="text-primary-500" size="md" />
        )}

        <VStack className="flex-1">
          <Text size="md" className="font-JakartaMedium">
            {label}
          </Text>
          {description && (
            <Text size="xs" className="text-typography-700">
              {description}
            </Text>
          )}
        </VStack>

        {icon && iconPosition === 'right' && (
          <Icon as={icon} className="text-primary-500" size="md" />
        )}
      </HStack>
    </Pressable>
  );
}
