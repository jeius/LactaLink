import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { createShadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { useBottomSheetScrollableCreator } from '@gorhom/bottom-sheet';
import {
  CollectionSlug,
  SelectFromCollectionSlug,
  TransformCollectionWithSelect,
} from '@lactalink/types/payload-types';
import { generatePlaceHoldersWithID } from '@lactalink/utilities';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { formatKebabToTitle } from '@lactalink/utilities/formatters';
import { areStrings } from '@lactalink/utilities/type-guards';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Href, useRouter } from 'expo-router';
import isString from 'lodash/isString';
import { Edit2Icon, PlusIcon } from 'lucide-react-native';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PressableProps } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../animated/pressable';
import { useTheme } from '../AppProvider/ThemeProvider';
import { FloatingActionButton } from '../buttons/FloatingActionButton';
import FetchingSpinner from '../loaders/FetchingSpinner';
import { NoData } from '../NoData';
import {
  BottomSheet,
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
  BottomSheetModalPortal,
  BottomSheetTrigger,
} from '../ui/bottom-sheet';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

type TValue<T extends boolean, V = unknown> = T extends true ? V[] : V | null | undefined;

export interface SelectItemProps<TSlug extends CollectionSlug = CollectionSlug> {
  item: TransformCollectionWithSelect<TSlug, SelectFromCollectionSlug<TSlug>>;
  isLoading?: boolean;
  canEdit?: boolean;
}

export interface SelectBottomSheetProps<
  T extends boolean = false,
  TSlug extends CollectionSlug = CollectionSlug,
  V extends string | TransformCollectionWithSelect<TSlug, SelectFromCollectionSlug<TSlug>> =
    | string
    | TransformCollectionWithSelect<TSlug, SelectFromCollectionSlug<TSlug>>,
> {
  selected: TValue<T, V>;
  onChange?: (selected: TValue<T, V>) => void;
  triggerComponent?: (props: PressableProps) => React.ReactNode;
  allowMultipleSelection?: T;
  slug: TSlug;
  collections?: V[];
  ItemComponent: FC<SelectItemProps<TSlug>>;
  title?: string;
  createLabel?: string;
  allowEdit?: boolean;
  allowCreate?: boolean;
  isDisabled?: boolean;
}

export function SelectBottomSheet<
  T extends boolean = false,
  TSlug extends CollectionSlug = CollectionSlug,
  V extends string | TransformCollectionWithSelect<TSlug, SelectFromCollectionSlug<TSlug>> =
    | string
    | TransformCollectionWithSelect<TSlug, SelectFromCollectionSlug<TSlug>>,
>({
  selected: selectedProps,
  onChange,
  triggerComponent,
  allowMultipleSelection = false as T,
  slug,
  collections = [],
  ItemComponent,
  title,
  createLabel,
  allowEdit = false,
  allowCreate = false,
  isDisabled,
}: SelectBottomSheetProps<T, TSlug, V>) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const isFocused = useIsFocused();

  const defaultSelected = (allowMultipleSelection ? [] : null) as TValue<T, V>;
  const defaultSelectedRef = useRef(selectedProps || defaultSelected);
  const [selected, setSelected] = useState(selectedProps || defaultSelected);
  const [isDirty, setIsDirty] = useState(false);
  const [open, setOpen] = useState(false);

  const BottomSheetScrollable = useBottomSheetScrollableCreator({ focusHook: useFocusEffect });

  const willFetch = areStrings(collections);

  const {
    data: fetchedData,
    isLoading,
    isFetching,
    isRefetching,
    refetch,
  } = useFetchBySlug(willFetch, {
    collection: slug,
    where: { id: { in: extractID(collections) } },
    populate: {
      users: { email: true },
    },
    sort: 'createdAt',
  });

  const data = useMemo(() => {
    const placeholderItems = generatePlaceHoldersWithID(10, {});
    return (
      isLoading ? placeholderItems : willFetch ? fetchedData || [] : extractCollection(collections)
    ) as TransformCollectionWithSelect<TSlug, SelectFromCollectionSlug<TSlug>>[];
  }, [isLoading, willFetch, fetchedData, collections]);

  useEffect(() => {
    setSelected(selectedProps);
    defaultSelectedRef.current = selectedProps;
    setIsDirty(false);
  }, [selectedProps]);

  useEffect(() => {
    if (!isFocused) {
      setOpen(false);
    }
  }, [isFocused]);

  function handleSave() {
    onChange?.(selected);
    setIsDirty(false);
    handleClose();
  }

  function handleCancel() {
    setSelected(defaultSelectedRef.current);
    setIsDirty(false);
  }

  function handleClose() {
    setOpen(false);
  }

  const renderItem = useCallback<
    ListRenderItem<TransformCollectionWithSelect<TSlug, SelectFromCollectionSlug<TSlug>>>
  >(
    ({ item, extraData: { selected, allowMultipleSelection, allowEdit } }) => {
      const selection: TValue<T, V> = selected;

      const isLoading = isPlaceHolderData(item);
      let isSelected = false;

      if (Array.isArray(selection)) {
        isSelected = selection.some((s) => extractID(s) === item.id);
      } else {
        isSelected = extractID(selection) === item.id;
      }

      function handlePress() {
        if (isSelected) {
          setSelected((prev) => {
            if (allowMultipleSelection && Array.isArray(prev)) {
              return prev.filter((s) => extractID(s) !== item.id) as TValue<T, V>;
            }
            return null as TValue<T, V>;
          });
        } else {
          setSelected((prev) => {
            if (allowMultipleSelection && Array.isArray(prev)) {
              return (isString(prev) ? [...prev, item.id] : [...prev, item]) as TValue<T, V>;
            }
            return (isString(prev) ? item.id : item) as TValue<T, V>;
          });
        }
        setIsDirty(true);
      }

      return (
        <AnimatedPressable className="overflow-hidden rounded-2xl" onPress={handlePress}>
          <CardWrapper isSelected={isSelected}>
            <ItemComponent item={item} isLoading={isLoading} canEdit={allowEdit} />
          </CardWrapper>
        </AnimatedPressable>
      );
    },
    [ItemComponent]
  );

  const handleCreateNew = useCallback(() => {
    handleClose();
    router.push(`/${slug}/create` as Href);
  }, [router, slug]);

  const EmptyComponent = useCallback(() => {
    return (
      !isLoading && (
        <VStack space="xl" className="mx-auto items-center p-4">
          <NoData title="Oops! Nothing to show here." />
          {allowCreate && (
            <Button onPress={handleCreateNew}>
              <ButtonIcon as={PlusIcon} />
              <ButtonText>{createLabel || `Create ${formatKebabToTitle(slug)}`}</ButtonText>
            </Button>
          )}
        </VStack>
      )
    );
  }, [isLoading, allowCreate, handleCreateNew, createLabel, slug]);

  const HeaderComponent = useCallback(() => {
    if (data?.length === 0) return null;

    let text = title || `Select one from ${formatKebabToTitle(slug)}`;
    if (isLoading) {
      text = `Loading ${formatKebabToTitle(slug)}...`;
    } else if (!title && allowMultipleSelection) {
      text = `Select one or more ${formatKebabToTitle(slug)}`;
    }

    return (
      <Box className="mx-auto mb-4">
        <Text size="lg" className="font-JakartaSemiBold">
          {text}
        </Text>
      </Box>
    );
  }, [data?.length, slug, isLoading, allowMultipleSelection, title]);

  const FooterComponent = useCallback(() => {
    const isEmpty = data?.length === 0;
    if ((isEmpty && !isLoading) || !allowCreate) return null;

    return (
      <Button size="sm" variant="link" action="default" onPress={handleCreateNew}>
        <ButtonIcon as={PlusIcon} />
        <ButtonText>{createLabel || `Create ${formatKebabToTitle(slug)}`}</ButtonText>
      </Button>
    );
  }, [data?.length, isLoading, allowCreate, handleCreateNew, createLabel, slug]);

  function Trigger() {
    if (triggerComponent) {
      return triggerComponent({
        disabled: isDisabled,
        onPress: () => {
          setOpen(true);
        },
      });
    }
    return (
      <Button size="sm" variant="link" action="positive" onPress={() => setOpen(true)}>
        <ButtonIcon as={Edit2Icon} className="text-success-500" />
        <ButtonText>Change {formatKebabToTitle(slug)}</ButtonText>
      </Button>
    );
  }

  return (
    <BottomSheet open={open} setOpen={setOpen}>
      <BottomSheetTrigger disabled={isDisabled} disableAnimation>
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
        <Box className="relative flex-1">
          <FlashList
            data={data}
            renderItem={renderItem}
            renderScrollComponent={BottomSheetScrollable}
            automaticallyAdjustKeyboardInsets
            keyboardShouldPersistTaps="always"
            onEndReachedThreshold={0.2}
            keyExtractor={(item) => item.id}
            extraData={{ selected, allowMultipleSelection, allowEdit, allowCreate }}
            ListEmptyComponent={EmptyComponent}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            ListHeaderComponent={HeaderComponent}
            ItemSeparatorComponent={() => <Box className="h-3" />}
            ListFooterComponent={FooterComponent}
            ListFooterComponentStyle={{
              marginVertical: 16,
              alignItems: 'flex-start',
            }}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 24,
              paddingHorizontal: 12,
              paddingTop: 12,
            }}
          />

          <FloatingActionButton show={isDirty} onConfirm={handleSave} onCancel={handleCancel} />
        </Box>

        <FetchingSpinner isFetching={isFetching} />
      </BottomSheetModalPortal>
    </BottomSheet>
  );
}

const cardWrapperStyle = tva({
  base: 'relative w-full p-0',
  variants: {
    isSelected: {
      true: 'border-success-500',
    },
  },
});

interface CardWrapperProps {
  isSelected?: boolean;
  children: React.ReactNode;
}
function CardWrapper({ isSelected, children }: CardWrapperProps) {
  return (
    <Card variant="filled" className={cardWrapperStyle({ isSelected })}>
      {children}
      {isSelected && (
        <Box
          className="bg-success-500 absolute right-0 top-0 px-4 py-2"
          style={{ borderBottomLeftRadius: 6 }}
        >
          <Text size="sm" className="text-success-0 font-JakartaSemiBold">
            Selected
          </Text>
        </Box>
      )}
    </Card>
  );
}
