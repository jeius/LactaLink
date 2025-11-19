import {
  CollectionSlug,
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
  Where,
} from '@lactalink/types/payload-types';
import debounce from 'lodash/debounce';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  InfiniteFetchOptions,
  useInfiniteFetchBySlug,
} from '@/hooks/collections/useInfiniteFetchBySlug';
import { ChevronDownIcon, LucideIcon, LucideProps, SearchIcon, XIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from './ui/box';
import { Button, ButtonIcon } from './ui/button';
import { Icon } from './ui/icon';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

import { useFetchById } from '@/hooks/collections/useFetchById';
import { getImageAsset } from '@/lib/stores';
import { shadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
import { ListRenderItem } from '@shopify/flash-list';
import { useFocusEffect } from 'expo-router';
import { TextInput } from 'react-native';
import { Image } from './Image';
import { RefreshControl } from './RefreshControl';
import {
  BottomSheet,
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
  BottomSheetFlashList,
  BottomSheetItem,
  BottomSheetModalPortal,
  BottomSheetTrigger,
} from './ui/bottom-sheet';
import {
  BottomSheetInput,
  BottomSheetInputField,
  BottomSheetInputIcon,
  BottomSheetInputSlot,
} from './ui/bottom-sheet/input';
import { HStack } from './ui/hstack';
import { Skeleton } from './ui/skeleton';

export type ComboboxType<
  T extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<T> = SelectFromCollectionSlug<T>,
> = {
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
  searchPath: keyof TransformCollectionWithSelect<T, TSelect>;
  /**
   * Path to the label field in the collection.
   * This will be used to display the label in the dropdown.
   * If not provided, it will default to the searchPath.
   */
  labelPath?: keyof TransformCollectionWithSelect<T, TSelect>;
  /**
   * Path to the description field in the collection.
   * If provided, it will be used to show additional information in the dropdown.
   * @todo Not implemented yet
   */
  descriptionPath?: keyof TransformCollectionWithSelect<T, TSelect>;
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

  isLoading?: boolean;
};

export type InfiniteScrollComboBoxProps<
  T extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<T> = SelectFromCollectionSlug<T>,
> = ComboboxType<T, TSelect> & {
  value?: string | null;
  onChange?: (val?: string | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
};

export default function ComboBox<
  T extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<T> = SelectFromCollectionSlug<T>,
>({
  collection,
  limit = 20,
  where: whereParam,
  placeholder,
  value: selectedProps,
  onChange,
  searchPath,
  labelPath = searchPath,
  descriptionPath,
  searchPlaceholder = 'Search here...',
  isDisabled: disabled,
  icon,
  iconPosition,
  isLoading: isLoadingProp,
}: InfiniteScrollComboBoxProps<T, TSelect>) {
  const inputRef = useRef<BottomSheetTextInputProps & TextInput>(null);

  const insets = useSafeAreaInsets();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(selectedProps);
  const [searchValue, setSearchValue] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSetSearch = useMemo(() => debounce(setSearch, 300), []);

  const { data: selectedDoc, isFetching: isFetchingLabel } = useFetchById(!!selected, {
    collection: collection,
    id: selected || '',
    depth: 0,
  });

  // @ts-expect-error TS can't infer deeply
  const selectedLabel = selectedDoc && String(selectedDoc[labelPath]);

  const searchQuery: Where = { [searchPath]: { contains: search.toLowerCase() } };
  const where: Where = whereParam ? { and: [searchQuery, whereParam] } : searchQuery;
  const options: InfiniteFetchOptions<T, TSelect> = {
    collection,
    depth: 0,
    where,
    sort: String(searchPath),
    limit,
  };

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, isRefetching, refetch } =
    useInfiniteFetchBySlug(true, options);

  const items = useMemo(() => data?.pages?.flatMap((page) => page.docs) || [], [data]);

  const clearSearch = () => {
    setSearch('');
    inputRef.current?.clear();
  };

  const handleClose = useCallback(() => setOpen(false), []);

  const handleSelectionChange = useCallback(
    (value?: string) => {
      handleClose();
      setTimeout(() => {
        setSelected(value);
        onChange?.(value);
      }, 50); // Delay to ensure the bottom sheet closes before setting the value
    },
    [handleClose, setSelected, onChange]
  );

  const resetSelection = useCallback(() => {
    clearSearch();
    handleSelectionChange(undefined);
  }, [handleSelectionChange]);

  const handleSearchChange = useCallback(
    (text: string) => debouncedSetSearch(text),
    [debouncedSetSearch]
  );

  const renderItem = useCallback<ListRenderItem<TransformCollectionWithSelect<T, TSelect>>>(
    ({ item, extraData: { selected } }) => {
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
    },
    [labelPath, descriptionPath, icon, iconPosition, handleSelectionChange]
  );

  useFocusEffect(useCallback(() => debouncedSetSearch.cancel(), [debouncedSetSearch]));

  useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

  useEffect(() => {
    setSelected(selectedProps);
  }, [selectedProps]);

  useEffect(() => {
    if (!open) setSearchValue(search);
  }, [open, search]);

  return isLoadingProp ? (
    <Skeleton className="h-10" />
  ) : (
    <BottomSheet open={open} setOpen={setOpen}>
      <BottomSheetTrigger
        disableAnimation
        className="w-full overflow-hidden rounded-lg"
        disabled={disabled}
      >
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
          <InputIcon as={ChevronDownIcon} pointerEvents="none" className="mr-3" />
        </Input>
      </BottomSheetTrigger>
      <BottomSheetModalPortal
        snapPoints={['50%']}
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
        <Box
          className="w-full border-b border-outline-100 bg-background-0 p-5 pt-0"
          style={shadow.sm}
        >
          <BottomSheetInput>
            <BottomSheetInputIcon as={SearchIcon} className="ml-3 text-primary-400" />
            <BottomSheetInputField
              ref={inputRef}
              defaultValue={searchValue}
              onChangeText={handleSearchChange}
              placeholder={searchPlaceholder}
            />
            {search && (
              <BottomSheetInputSlot onPress={clearSearch} className="pr-3">
                <Icon as={XIcon} size="sm" className="text-secondary-400" />
              </BottomSheetInputSlot>
            )}
          </BottomSheetInput>
        </Box>

        <Box className="h-full w-full">
          <BottomSheetFlashList
            data={items}
            renderItem={renderItem}
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            onEndReachedThreshold={0.2}
            keyExtractor={(item) => item.id}
            extraData={{ selected: selected }}
            ListEmptyComponent={() => <EmptyComponent isLoading={isLoading} />}
            contentContainerStyle={{ paddingBottom: insets.bottom }}
            ListFooterComponentStyle={{ marginBottom: 36 }}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            ListHeaderComponent={isLoading ? <Spinner size="large" className="mt-4" /> : null}
            ListFooterComponent={isFetchingNextPage ? <Spinner size="small" /> : null}
            onEndReached={hasNextPage && !isFetchingNextPage ? fetchNextPage : undefined}
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
  const style = useMemo(
    () =>
      tva({
        base: 'items-center px-4 py-3',
        variants: {
          isSelected: { true: 'bg-primary-200' },
          isPressed: { true: 'bg-background-100' },
        },
      }),
    []
  );
  const [isPressed, setIsPressed] = useState(false);
  const onPressIn = () => setIsPressed(true);
  const onPressOut = () => setIsPressed(false);
  return (
    <BottomSheetItem onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
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
    </BottomSheetItem>
  );
}

function EmptyComponent({ isLoading }: { isLoading: boolean }) {
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
      </VStack>
    )
  );
}
