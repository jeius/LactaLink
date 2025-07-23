import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { createShadow } from '@/lib/utils/shadows';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Collection, CollectionSlug, Where } from '@lactalink/types';
import { areStrings, extractCollection, extractID, formatKebabToTitle } from '@lactalink/utilities';
import { useIsFocused } from '@react-navigation/native';
import { ListRenderItem } from '@shopify/flash-list';
import { Href, useRouter } from 'expo-router';
import { Edit2Icon, PlusIcon } from 'lucide-react-native';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, useWindowDimensions } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../animated/pressable';
import { useTheme } from '../AppProvider/ThemeProvider';
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
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

type TValue<T extends boolean = false> = T extends true ? string[] : string;

export interface SelectItemProps<TSlug extends CollectionSlug = CollectionSlug> {
  item: Collection<TSlug>;
  isLoading?: boolean;
  canEdit?: boolean;
}

export interface SelectBottomSheetProps<
  T extends boolean = false,
  TSlug extends CollectionSlug = CollectionSlug,
> {
  selected?: TValue<T> | null;
  onChange?: (selected: TValue<T>) => void;
  triggerComponent?: (props: { onPress: (e?: GestureResponderEvent) => void }) => React.ReactNode;
  allowMultipleSelection?: T;
  slug: TSlug;
  collections?: (string | Collection<TSlug>)[];
  ItemComponent: FC<SelectItemProps<TSlug>>;
  title?: string;
  createLabel?: string;
  allowEdit?: boolean;
  allowCreate?: boolean;
}

export function SelectBottomSheet<
  T extends boolean = false,
  TSlug extends CollectionSlug = CollectionSlug,
>({
  selected: selectedProps,
  onChange,
  triggerComponent,
  allowMultipleSelection,
  slug,
  collections = [],
  ItemComponent,
  title,
  createLabel,
  allowEdit = false,
  allowCreate = false,
}: SelectBottomSheetProps<T, TSlug>) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const isFocused = useIsFocused();

  const { width: DEVICE_WIDTH } = useWindowDimensions();

  const defaultSelectedIDs = useRef<TValue<T> | undefined | null>(selectedProps);
  const [selected, setSelected] = useState<TValue<T> | undefined | null>(selectedProps);
  const [isDirty, setIsDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const [listSize, setListSize] = useState({ height: 360, width: DEVICE_WIDTH });

  const shouldFetch = areStrings(collections);
  const where: Where = { id: { in: extractID(collections) } };

  const { data: fetchedData, ...fetchQuery } = useFetchBySlug(shouldFetch, {
    collection: slug,
    where,
    populate: {
      users: { email: true },
    },
    sort: 'createdAt',
  });

  const isLoading = fetchQuery.isLoading;
  const isFetching = fetchQuery.isFetching;
  const isRefetching = fetchQuery.isRefetching;
  const error = fetchQuery.error;

  const data = useMemo(() => {
    const placeholderItems = Array.from({ length: 10 }, (_, i) => ({
      id: `placeholder-${i}`,
    })) as Collection<TSlug>[];

    if (shouldFetch) {
      return isLoading ? placeholderItems : fetchedData;
    } else {
      return extractCollection(collections);
    }
  }, [shouldFetch, isLoading, fetchedData, collections]);

  useEffect(() => {
    setSelected(selectedProps);
    defaultSelectedIDs.current = selectedProps;
    setIsDirty(false);
  }, [selectedProps]);

  useEffect(() => {
    if (!isFocused) {
      setOpen(false);
    }
  }, [isFocused]);

  function handleSave() {
    if (!selected || (Array.isArray(selected) && selected.length === 0)) {
      return;
    }
    onChange?.(selected);
    setIsDirty(false);
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
  }

  const renderItem = useCallback<ListRenderItem<Collection<TSlug>>>(
    ({ item, extraData: { selected, allowMultipleSelection, allowEdit, _allowCreate } }) => {
      const selection: TValue<T> = selected;

      const isLoading = item.id.includes('placeholder');
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
            data={data || []}
            renderItem={renderItem}
            estimatedItemSize={200}
            automaticallyAdjustKeyboardInsets
            keyboardShouldPersistTaps="always"
            onEndReachedThreshold={0.2}
            keyExtractor={(item) => item.id}
            extraData={{ selected, allowMultipleSelection, allowEdit, allowCreate }}
            ListEmptyComponent={EmptyComponent}
            estimatedListSize={listSize}
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
